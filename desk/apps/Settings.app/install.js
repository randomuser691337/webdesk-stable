app['settings'] = {
    runs: true,
    name: 'Settings',
    init: async function () {
        const main = tk.mbw('Settings', '310px', 'auto', true, undefined, undefined, '/apps/Settings.app/Contents/icon.svg');
        const generalPane = tk.c('div', main.main, 'hide');
        const appearPane = tk.c('div', main.main, 'hide');
        const accPane = tk.c('div', main.main, 'hide');
        const userPane = tk.c('div', main.main, 'hide');
        const appPane = tk.c('div', main.main, 'hide');
        tk.p('App Management', undefined, appPane);
        const shitStain = tk.c('div', appPane);
        const mainPane = tk.c('div', main.main);
        if (sys.mobui === false) {
            main.win.style.maxHeight = "65%";
        }
        // Main pane
        if (sys.guest !== true) {
            const userl = tk.c('div', mainPane, 'list flexthing');
            const tnav = tk.c('div', userl, 'tnav med');
            const title = tk.c('div', userl, 'title');
            tnav.style.marginLeft = "4px";
            tnav.innerText = ui.filter(sys.name);
            tk.cb('b3', 'Manage data', () => ui.sw2(mainPane, userPane), title);
            tk.cb('b1 b2', 'General', () => ui.sw2(mainPane, generalPane), mainPane);
        } else {
            tk.p(`Some options are disabled, because you're in Guest mode.`, undefined, mainPane);
        }
        tk.cb('b1 b2', 'Accessibility', () => ui.sw2(mainPane, accPane), mainPane);
        tk.cb('b1 b2', 'Manage apps', async function () {
            ui.sw2(mainPane, appPane);
            shitStain.innerHTML = "";
            const contents = await fs.ls('/apps/');
            for (const item of contents.items) {
                if (item.type === "folder") {
                    if (item.path.includes('.app')) {
                        const skibidi2 = await fs.ls(item.path);
                        for (const item3 of skibidi2.items) {
                            if (item3.name === "manifest.json") {
                                const thing = await fs.read(item3.path);
                                const entry = JSON.parse(thing);
                                console.log(entry);
                                const notif = tk.c('div', shitStain, 'notif2');
                                tk.p(entry.name, 'bold', notif);
                                tk.ps(`${entry.dev} - Ver ${entry.ver}`, undefined, notif);
                                tk.cb('b3', 'App info', async function () {
                                    const ok = tk.c('div', document.body, 'cm');
                                    tk.p('App Info', 'h2', ok);
                                    const ok2 = tk.c('div', ok, undefined);
                                    tk.p(`<span class="bold">Name</span> ` + entry.name, undefined, ok2);
                                    if (entry.installedon === undefined) {
                                        tk.p(`<span class="bold">Modified</span> Unknown`, undefined, ok2);
                                    } else {
                                        tk.p(`<span class="bold">Modified</span> ` + wd.timec(entry.installedon), undefined, ok2);
                                    }
                                    const appid = tk.p(`<span class="bold">App ID</span> `, undefined, ok2);
                                    const appids = tk.c('span', appid);
                                    appids.innerText = entry.appid;
                                    if (entry.dev === undefined) {
                                        tk.p(`<span class="bold">Developer</span> ` + 'Unknown', undefined, ok2);
                                    } else {
                                        const dev = tk.p(`<span class="bold">Developer</span> `, undefined, ok2);
                                        const devs = tk.c('span', dev);
                                        devs.innerText = entry.dev;
                                    }
                                    const ver = tk.p(`<span class="bold">Version</span> `, undefined, ok2);
                                    const vers = tk.c('span', ver);
                                    vers.innerText = entry.ver;
                                    tk.cb('b1', 'Close', () => ui.dest(ok), ok)
                                }, notif);
                                tk.cb('b3', 'Remove', async function () {
                                    await fs.delfold(entry.lastpath);
                                    ui.slidehide(notif);
                                    delete app[entry.appid];
                                    wm.notif(`${entry.name} removed`, `Reboot to finish removal`, () => wd.reboot(), 'Reboot', true);
                                }, notif);
                            }
                        }
                    }
                }
            }
        }, mainPane);
        tk.cb('b1 b2', 'Personalize', () => ui.sw2(mainPane, appearPane), mainPane);
        // General pane
        tk.p('General', undefined, generalPane);
        tk.cb('b1 b2 red', 'Reinstall WebDesk (keep data)', async function () {
            await fs.del('/system/webdesk');
            wd.reboot();
        }, generalPane);
        /* tk.cb('b1 b2 red', 'Request Persistence (Stops browser from erasing WebDesk)', async function () {
            const fucker = await fs.persist();
            if (fucker === true) {
                app.ach.unlock('The Keeper', `Won't save your data from the death of the universe, though!`);
                wm.snack('Persistence turned on');
            } else {
                wm.snack(`Couldn't turn on persistence`);
            }
        }, generalPane); */
        if (sys.mob === true) {
            tk.cb('b1 b2 red', 'Toggle mobile UI', async function () {
                if (sys.mobui === true) {
                    await fs.write('/user/info/mobile', 'false');
                } else {
                    await fs.del('/user/info/mobile');
                }
                wm.notif('Reboot to apply changes', undefined, () => wd.reboot(), 'Reboot', true);
            }, generalPane);
        }
        if (window.navigator.standalone === true) {
            tk.cb('b1 b2 red', 'Recalibrate App Bar', function () {
                wd.tbcal();
            }, generalPane);
        }
        tk.cb('b1 b2 red', 'Enter Recovery Mode', function () {
            fs.write('/system/migval', 'rec');
            wd.reboot();
        }, generalPane);
        tk.cb('b1 b2 red', 'Developer Mode', async function () {
            const win = tk.c('div', document.body, 'cm');
            const opt = await fs.read('/system/info/devmode');
            const pane = tk.c('div', win);
            if (opt !== "true") {
                tk.img('/system/lib/img/icons/warn.svg', 'setupi', pane);
                tk.p(`Developer Mode lets you install third-party apps, and enables dev tools, but removes security protections.`, undefined, pane);
                tk.p(`Use caution, there's no support for issues relating to Developer Mode. Disabling Developer Mode will erase WebDesk, but will keep your files.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Enable (reboot)', async function () {
                    await fs.write(`/system/info/devmode`, 'true');
                    await wd.reboot();
                }, pane);
            } else {
                tk.img('/system/lib/img/icons/hlcrab.png', 'setupi', pane);
                tk.p(`Developer Mode enabled`, 'bold', pane);
                tk.p(`Disabling it will reset WebDesk, but will keep your files, along with your DeskID and name.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Disable (reboot)', async function () {
                    await fs.delfold('/system/');
                    await fs.delfold('/user/info/');
                    await fs.write('/user/info/name', sys.name);
                    await fs.write('/system/deskid', sys.deskid);
                    await wd.reboot();
                }, pane);
            }
        }, generalPane);
        tk.cb('b1 b2 red', 'Erase...', () => app.settings.eraseassist.init(), generalPane);
        const pgfx = tk.c('div', generalPane, 'list');
        const okgfx = tk.c('span', pgfx);
        okgfx.innerText = "Graphics ";
        tk.cb('b7', 'Low', async function () {
            wm.notif('Graphics set to low', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'true');
        }, pgfx);
        tk.cb('b7', 'Med', async function () {
            wm.notif('Graphics set to medium', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'half');
        }, pgfx);
        tk.cb('b7', 'High', async function () {
            wm.notif('Graphics set to high (default)', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.del('/system/info/lowgfx');
        }, pgfx);
        tk.cb('b7', 'Epic', async function () {
            wm.notif('Graphics set to epic', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await fs.write('/system/info/lowgfx', 'epic');
        }, pgfx);
        const p = tk.c('div', generalPane, 'list');
        const ok = tk.c('span', p);
        ok.innerText = "Clock seconds ";
        tk.cb('b7', 'On', async function () {
            sys.seconds = true;
            await fs.write('/user/info/clocksec', 'true');
        }, p);
        tk.cb('b7', 'Off', async function () {
            sys.seconds = false;
            await fs.write('/user/info/clocksec', 'false');
        }, p);
        tk.cb('b1', 'Back', () => ui.sw2(generalPane, mainPane), generalPane);
        // Appearance pane
        tk.p('Personalize', undefined, appearPane);
        const bg1 = tk.c('input', appearPane, 'i1');
        bg1.setAttribute("data-jscolor", "{}");
        bg1.addEventListener('input', function () {
            ui.crtheme(event.target.value);
        });
        bg1.value = await fs.read('/user/info/color');
        new JSColor(bg1, undefined);
        const modething = tk.p('', undefined, appearPane);
        tk.cb('b1', 'Light', function () {
            fs.del('/user/info/lightdarkpref');
            sys.autodarkacc = false;
            wd.light();
        }, modething);
        tk.cb('b1', 'Dark', function () {
            fs.del('/user/info/lightdarkpref');
            sys.autodarkacc = false;
            wd.dark();
        }, modething);
        tk.cb('b1', 'Auto', async function () {
            fs.write('/user/info/lightdarkpref', 'auto');
            const killyourselfapplesheep = await fs.read('/user/info/color');
            ui.crtheme(killyourselfapplesheep);
            sys.autodarkacc = true;
        }, modething);
        tk.cb('b1', 'Clear (light)', function () {
            fs.del('/user/info/lightdarkpref');
            sys.autodarkacc = false;
            wd.clearm2();
        }, modething);
        const btn2 = tk.cb('b1', 'Clear (dark)', function () {
            fs.del('/user/info/lightdarkpref');
            sys.autodarkacc = false;
            wd.clearm();
        }, modething);
        tk.p('Sounds', undefined, appearPane);
        const p4 = tk.c('div', appearPane, 'list');
        const ok4 = tk.c('span', p4);
        ok4.innerText = "Notifications ";
        tk.cb('b7', '1', async function () {
            wd.notifsrc('/system/lib/other/notif1.wav', true);
        }, p4);
        tk.cb('b7', '2', async function () {
            wd.notifsrc('/system/lib/other/notif2.wav', true);
        }, p4);
        tk.cb('b7', '3', async function () {
            wd.notifsrc('/system/lib/other/notif3.wav', true);
        }, p4);
        tk.cb('b7', '4', async function () {
            wd.notifsrc('/system/lib/other/notif4.wav', true);
        }, p4);
        tk.cb('b7', 'More', async function () {
            const menu = tk.c('div', document.body, 'cm');
            tk.p('Custom notification sound', 'bold', menu);
            const the = tk.c('input', menu, 'i1');
            the.placeholder = "URL of sound here";
            const ok = await fs.read('/user/info/cnotifurl');
            if (ok === "true") {
                const ok2 = await fs.read('/user/info/notifsrc');
                the.value = ok2;
            }
            tk.cb('b1', 'Close', () => ui.dest(menu), menu); tk.cb('b1', 'Save', async function () {
                try {
                    await wd.notifsrc(the.value, true);
                    await fs.write('/user/info/cnotifurl', 'true');
                } catch (error) {
                    wm.snack(`URL failed. Try a different one!`);
                }
            }, menu);
        }, p4);
        p4.style.marginBottom = '6px';
        tk.cb('b1', 'Reset Colors', function () {
            fs.del('/user/info/color');
            fs.del('/user/info/lightdark');
            fs.del('/user/info/lightdarkpref');
            wd.defaultcolor();
            wm.snack('Reset colors');
        }, appearPane); tk.cb('b1', 'Back', () => ui.sw2(appearPane, mainPane), appearPane);
        // User pane
        tk.p('WebDesk User', undefined, userPane);
        tk.p(`Keep your WebDesk open when possible. <span class="bold">When WebDesk isn't open, anyone's able to take your DeskID.</span>`, undefined, userPane);
        tk.cb('b1 b2', 'Location', function () {
            app.settings.locset.init();
        }, userPane);
        tk.cb('b1 b2', 'Change DeskID', function () {
            const ok = tk.mbw('Change DeskID', '300px', 'auto', true, undefined, undefined);
            tk.p(`Changing your DeskID will make your WebDesk unreachable to those without your new ID.`, undefined, ok.main);
            let yeah = false;
            tk.cb('b1', 'Continue', async function () {
                yeah = true;
                const newid = await wd.newid();
                ok.main.innerHTML = `<p>Reboot WebDesk to finish changing your DeskID.</p><p>All unsaved data will be lost. Your new ID is ${newid}.</p>`;
                tk.cb('b1', 'Reboot', () => wd.reboot(), ok.main);
                app.ach.unlock('The Vanisher', 'Good luck WebDropping to nothing!');
            }, ok.main);
            ok.closebtn.addEventListener('mousedown', function () {
                if (yeah === false) {
                    app.ach.unlock('Nevermind', 'Your dark reputation follows you.');
                }
            });
        }, userPane);
        tk.cb('b1 b2', 'Change Name', function () {
            const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
            const inp = tk.c('input', ok.main, 'i1');
            inp.placeholder = "New name here";
            tk.cb('b1', 'Change name', async function () {
                if (inp.value.length > 14) {
                    wm.snack(`Set a name under 14 characters`, 3200);
                    return;
                }
                await fs.write('/user/info/name', inp.value);
                ok.main.innerHTML = `<p>Reboot WebDesk to finish changing your username.</p><p>All unsaved data will be lost.</p>`;
                tk.cb('b1', 'Reboot', () => wd.reboot(), ok.main);
            }, ok.main);
        }, userPane);
        tk.cb('b1', 'Back', () => ui.sw2(userPane, mainPane), userPane);
        // Access pane
        tk.p('Accessibility', undefined, accPane);
        const p2 = tk.c('div', accPane, 'list');
        const ok2 = tk.c('span', p2);
        ok2.innerText = "Font size ";
        tk.cb('b7', 'Big', async function () {
            wd.bgft();
            fs.write('/user/info/font', 'big');
        }, p2);
        tk.cb('b7', 'Normal', function () {
            wd.meft();
            fs.write('/user/info/font', 'normal');
        }, p2);
        tk.cb('b7', 'Small', function () {
            wd.smft();
            fs.write('/user/info/font', 'small');
        }, p2);
        const p3 = tk.c('div', accPane, 'list');
        const ok3 = tk.c('span', p3);
        ok3.innerHTML = `SFW mode (Filters text before it's seen to help stop things like <a href="https://www.gaggle.net/" target="_blank">this</a>) `;
        tk.cb('b7', 'No chances', async function () {
            sys.filter = true;
            sys.nc = true;
            fs.write('/user/info/filter', 'nc');
            wm.notif('No chances mode on!', `Text with filtered items simply won't be shown. WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b7', 'Filter', async function () {
            sys.filter = true;
            sys.nc = false;
            fs.write('/user/info/filter', 'true');
            wm.notif('SFW mode on!', `WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b7', 'Off', function () {
            sys.filter = false;
            sys.nc = false;
            fs.del('/user/info/filter');
            wm.snack('SFW mode turned off');
        }, p3);
        tk.cb('b1', 'Back', () => ui.sw2(accPane, mainPane), accPane);
        // App pane
        tk.cb('b1', 'Back', () => ui.sw2(appPane, mainPane), appPane);
    },
    eraseassist: {
        runs: false,
        init: function () {
            ui.play('/system/lib/other/error.wav');
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`You're about to erase this WebDesk. This can't be undone, everything will be deleted forever.`, undefined, menu);
            tk.cb('b1', 'Erase', () => fs.erase('reboot'), menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
        }
    },
    locset: {
        runs: false,
        init: function () {
            const ok = tk.mbw('Location Settings', '320px', 'auto', true, undefined, undefined);
            const locp = tk.p(`<span class="bold">Location</span> `, undefined, ok.main);
            const locps = tk.c('span', locp);
            locps.innerText = sys.city;
            const upp = tk.p(`<span class="bold">Updated </span> `, undefined, ok.main);
            const upps = tk.c('span', upp);
            upps.innerText = wd.timec(sys.loclast);
            const degp = tk.p(`<span class="bold">Measurement</span> `, undefined, ok.main);
            const degps = tk.c('span', degp);
            degps.innerText = `${sys.unit} (${sys.unitsym})`;
            const mousedownevent = new MouseEvent('click');
            tk.cb('b1 b2', 'Disable Location', async function () {
                await fs.write('/user/info/location.json', [{ city: 'Paris, France', unit: 'Metric', lastupdate: Date.now(), default: true }]);
                sys.city = "Paris, France";
                sys.unit = "Metric";
                sys.unitsym = "°C";
                sys.defaultloc = true;
                ok.closebtn.dispatchEvent(mousedownevent);
                wm.snack('Location set to Paris, France so that WebDesk has something to fall back on.');
            }, ok.main);
            tk.cb('b1 b2', 'Update Location', async function () {
                wd.wetter(false);
            }, ok.main);
        }
    },
};