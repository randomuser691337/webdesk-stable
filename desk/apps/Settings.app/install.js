app['settings'] = {
    runs: true,
    name: 'Settings',
    init: async function (type) {
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
            userl.style.padding = "5px";
            const tnav = tk.c('div', userl, 'tnav med');
            const title = tk.c('div', userl, 'title');
            tnav.style.marginLeft = "4px";
            tnav.innerText = ui.filter(sys.name);
            tk.cb('b3', 'Manage data/user', () => ui.sw2(mainPane, userPane), title)
            const genbtn = tk.cb('b1 b2 settingsb2', ``, () => ui.sw2(mainPane, generalPane), mainPane);
            tk.emojicon(genbtn, '⚙️', '#4a4a4a', 'General');
        } else {
            tk.p(`Some options are disabled, because you're in Guest mode.`, undefined, mainPane);
        }
        const accbtn = tk.cb('b1 b2 settingsb2', ``, () => ui.sw2(mainPane, accPane), mainPane);
        tk.emojicon(accbtn, '🦽', '#4a4aee', 'Accessibility');
        const appbtn = tk.cb('b1 b2 settingsb2', '', async function () {
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
                                if (sys.dev === true) {
                                    console.log(entry);
                                }

                                if (entry.appid === "System app") {
                                    continue;
                                }

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
                                    wm.notif(`${entry.name} removed`, `Reboot to finish removal, it might be in RAM`, () => wd.reboot(), 'Reboot', true);
                                }, notif);
                            }
                        }
                    }
                }
            }
        }, mainPane);
        tk.emojicon(appbtn, '📦', '#4aee4a', 'Manage apps');
        const perbtn = tk.cb('b1 b2 settingsb2', 'Personalize', () => ui.sw2(mainPane, appearPane), mainPane);
        tk.emojicon(perbtn, '🎨', '#cc4a4a', 'Personalize');
        // General pane
        tk.p('General', undefined, generalPane);
        tk.cb('b1 b2 lt', 'Reinstall WebDesk (keep data)', async function () {
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Reinstall WebDesk?`, 'bold', menu);
            tk.p(`WebDesk will reboot, and install the latest version. No user data will be lost.`, undefined, menu);
            tk.cb('b1 nodont', 'Deep Clean', async function () {
                await fs.delfold('/system/');
                await wd.reboot();
                ui.dest(dark);
            }, menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
        }, generalPane);
        tk.cb('b1 b2 lt', 'Deep Clean (keep data)', async function () {
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`WebDesk will reboot, update and clean out cache from old versions. No user data will be lost.`, undefined, menu);
            tk.cb('b1 nodont', 'Deep Clean', async function () {
                await fs.delfold('/system/');
                await wd.reboot();
                ui.dest(dark);
            }, menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
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
            tk.cb('b1 b2', 'Toggle mobile UI', async function () {
                if (sys.mobui === true) {
                    await set.set('mobile', 'false');
                } else {
                    await set.del('mobile');
                }
                wm.notif('Reboot to apply changes', undefined, () => wd.reboot(), 'Reboot', true);
            }, generalPane);
        }
        if (window.navigator.standalone === true) {
            tk.cb('b1 b2', 'Recalibrate App Bar', function () {
                wd.tbcal();
            }, generalPane);
        }
        tk.cb('b1 b2 lt', 'Enter Recovery Mode', function () {
            fs.write('/system/migval', 'rec');
            wd.reboot();
        }, generalPane);
        tk.cb('b1 b2 lt', 'Developer Mode', async function () {
            const win = tk.c('div', document.body, 'cm');
            const opt = await fs.read('/system/info/devmode');
            const pane = tk.c('div', win);
            if (opt !== "true") {
                tk.img('/system/lib/img/icons/warn.svg', 'setupi', pane);
                tk.p(`Use caution, there's no support for issues relating to Developer Mode. Disabling Developer Mode will erase WebDesk, but will keep your files.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Enable (reboot)', async function () {
                    await fs.write(`/system/info/devmode`, 'true');
                    await wd.reboot();
                }, pane);
            } else {
                tk.img('/system/lib/img/icons/hlcrab.png', 'setupi', pane);
                tk.p(`Developer Mode enabled`, 'bold', pane);
                tk.p(`Disabling it will reset WebDesk and delete music, but will keep your files, along with your username.`, undefined, pane);
                tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                tk.cb(`b1`, 'Disable (reboot)', async function () {
                    await fs.delfold('/system/');
                    await fs.delfold('/user/info/');
                    await fs.delfold('/apps/');
                    await set.set('name', sys.name);
                    await wd.reboot();
                }, pane);
            }
        }, generalPane);
        tk.cb('b1 b2 lt', 'Erase...', () => app.settings.eraseassist.init(), generalPane);
        const pgfx2 = tk.c('div', generalPane, 'list flexthing');
        const tnavgfx2 = tk.c('div', pgfx2, 'tnav');
        const titlegfx2 = tk.c('div', pgfx2, 'title');
        tnavgfx2.innerText = "Graphics ";
        tk.cb('b4', 'Low', async function () {
            wm.notif('Graphics set to low', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await set.set('lowgfx', 'true');
        }, titlegfx2);
        tk.cb('b4', 'Med', async function () {
            wm.notif('Graphics set to medium', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await set.set('lowgfx', 'half');
        }, titlegfx2);
        tk.cb('b4', 'High', async function () {
            wm.notif('Graphics set to high (default)', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await set.del('lowgfx');
        }, titlegfx2);
        tk.cb('b4', 'Epic', async function () {
            wm.notif('Graphics set to epic', `Reboot to apply`, function () {
                wd.reboot();
            }, 'Reboot', true);
            await set.set('lowgfx', 'epic');
        }, titlegfx2);


        const pgfx = tk.c('div', generalPane, 'list flexthing');
        const tnavgfx = tk.c('div', pgfx, 'tnav');
        const titlegfx = tk.c('div', pgfx, 'title');
        tnavgfx.innerText = "Effects";
        tk.cb('b4', 'Off', async function () {
            ui.cv('anim', '0s');
            await set.set('anim', 'disabled');
            sys.animspeed = 0;
            sys.animspeed2 = 0;
        }, titlegfx);
        tk.cb('b4', 'Fast', async function () {
            ui.cv('anim', '0.15s');
            await set.set('anim', 'half');
            sys.animspeed = 60;
            sys.animspeed2 = 100;
        }, titlegfx);
        tk.cb('b4', 'Default', async function () {
            ui.cv('anim', '0.3s');
            await set.del('anim');
            sys.animspeed = 120;
            sys.animspeed2 = 200;
        }, titlegfx);
        tk.cb('b4', 'Slow', async function () {
            ui.cv('anim', '0.45s');
            sys.animspeed = 175;
            sys.animspeed2 = 300;
            await set.set('anim', 'slow');
        }, titlegfx);

        const p = tk.c('div', generalPane, 'list flexthing');
        const tnav = tk.c('div', p, 'tnav');
        const title = tk.c('div', p, 'title');
        tnav.innerText = "Clock seconds ";
        tk.cb('b4', 'On', async function () {
            sys.seconds = true;
            await set.set('clocksec', 'true');
        }, title);
        tk.cb('b4', 'Off', async function () {
            sys.seconds = false;
            await set.set('clocksec', 'false');
        }, title);
        tk.cb('b1', 'Back', () => ui.sw2(generalPane, mainPane), generalPane);
        // Appearance pane
        tk.p('Personalize', undefined, appearPane);
        const bg1 = tk.c('input', appearPane, 'i1');
        bg1.setAttribute("data-jscolor", "{}");
        bg1.addEventListener('input', function (e) {
            ui.crtheme(e.target.value);
        });
        bg1.value = await set.read('color');
        new JSColor(bg1, undefined);
        const modething = tk.p('', undefined, appearPane);
        tk.cb('b1', 'Light', function () {
            set.del('lightdarkpref');
            sys.autodarkacc = false;
            wd.light();
        }, modething);
        tk.cb('b1', 'Dark', function () {
            set.del('lightdarkpref');
            sys.autodarkacc = false;
            wd.dark();
        }, modething);
        tk.cb('b1', 'Auto', async function () {
            set.set('lightdarkpref', 'auto');
            const killyourselfapplesheep = await set.read('color');
            ui.crtheme(killyourselfapplesheep);
            sys.autodarkacc = true;
        }, modething);
        const pgfx3 = tk.c('div', appearPane, 'list flexthing');
        const tnavgfx3 = tk.c('div', pgfx3, 'tnav');
        const titlegfx3 = tk.c('div', pgfx3, 'title');
        tnavgfx3.innerText = "Window style";
        tk.cb('b4', '1', async function () {
            app.settings.winopt('1');
        }, titlegfx3);
        tk.cb('b4', '2', async function () {
            app.settings.winopt('2');
        }, titlegfx3);
        /* tk.cb('b4', '3', async function () {
            while (sys.styleadded.length > 0) {
                sys.stylesheet.deleteRule(sys.styleadded.pop());
            }
            sys.styleadded.push(sys.stylesheet.insertRule('.tb { background-color: rgba(0, 0, 0, 0) !important; }', sys.stylesheet.cssRules.length));
            // sys.styleadded.push(sys.stylesheet.insertRule('.content { padding: 9px !important; }', sys.stylesheet.cssRules.length));
            // sys.styleadded.push(sys.stylesheet.insertRule('.window { padding: 6px !important; }', sys.stylesheet.cssRules.length));
        }, titlegfx3); */
        tk.p('Wallpaper', undefined, appearPane);
        const wallp = tk.p('', undefined, appearPane);
        wallp.style = "display: flex; justify-content: space-between; padding: 0px; margin: 0px;";
        const wbtn1 = tk.cb('b1 b2', 'Manage', function () {
            app.settings.wallpapers.init();
        }, wallp);
        wbtn1.style = "flex: 1 1; margin-right: 1px !important;";
        const wbtn2 = tk.cb('b1 b2', 'Upload', function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';
            input.addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();

                    reader.onload = async function (e) {
                        const silly = e.target.result;
                        wd.setwall(silly, true);
                    };

                    reader.readAsDataURL(file);
                }
            });

            input.click();
        }, wallp);
        wbtn2.style = "flex: 1 1; margin-left: 1px !important;";
        tk.p('Sounds', undefined, appearPane);
        const p4 = tk.c('div', appearPane, 'list');
        const ok4 = tk.c('span', p4);
        ok4.innerText = "Notifications ";
        tk.cb('b4', '1', async function () {
            wd.notifsrc('/system/lib/other/notif1.wav', true);
        }, p4);
        tk.cb('b4', '2', async function () {
            wd.notifsrc('/system/lib/other/notif2.wav', true);
        }, p4);
        tk.cb('b4', '3', async function () {
            wd.notifsrc('/system/lib/other/notif3.wav', true);
        }, p4);
        tk.cb('b4', '4', async function () {
            wd.notifsrc('/system/lib/other/notif4.wav', true);
        }, p4);
        tk.cb('b4', 'More', async function () {
            const menu = tk.c('div', document.body, 'cm');
            tk.p('Custom notification sound', 'bold', menu);
            const the = tk.c('input', menu, 'i1');
            the.placeholder = "URL of sound here";
            const ok = await set.read('cnotifurl');
            if (ok === "true") {
                const ok2 = await set.read('notifsrc');
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
        tk.cb('b1', 'Reset Colors', async function () {
            set.del('color');
            set.del('lightdark');
            set.del('lightdarkpref');
            const raiseyopawifyouafuckingfaggot = await wd.defaulttheme();
            console.log(raiseyopawifyouafuckingfaggot);
            bg1.value = await ui.rgbtohex(raiseyopawifyouafuckingfaggot);
            wm.snack('Reset colors');
        }, appearPane); tk.cb('b1', 'Back', () => ui.sw2(appearPane, mainPane), appearPane);
        // User pane
        tk.p('WebDesk User', undefined, userPane);
        tk.p(`Account created on ${wd.timec(webid.userid)}`, undefined, userPane);
        /* tk.cb('b1 b2', 'Change DeskID', function () {
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
        }, userPane); */
        tk.cb('b1 b2', 'Change Username', function () {
            const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
            const inp = tk.c('input', ok.main, 'i1');
            inp.placeholder = "New name here";
            tk.cb('b1', 'Change name', async function () {
                if (inp.value.length > 16) {
                    wm.snack(`Set a name under 16 characters`, 3200);
                    return;
                }

                sys.socket.emit("changeusername", { token: webid.token, name: inp.value });
            }, ok.main);
            sys.socket.on("changeuserdone", async () => {
                sys.name = inp.value;
                await fs.write('/user/info/name', inp.value);
                wm.snack(`Name changed to ${inp.value}`);
                wm.close(ok.win);
            });
        }, userPane);
        tk.cb('b1 b2', 'Change Password', function () {
            const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
            tk.p(`Changing your password will log you out of all WebDesks, except for this one.`, undefined, ok.main);
            tk.p(`This WebDesk will reboot after password change.`, undefined, ok.main);
            const inp = tk.c('input', ok.main, 'i1');
            inp.placeholder = "Old password";
            inp.type = "password";
            const inp2 = tk.c('input', ok.main, 'i1');
            inp2.placeholder = "New password";
            inp2.type = "password";
            tk.cb('b1', 'Change name', async function () {
                if (inp.value.length > 16) {
                    wm.snack(`Set a name under 16 characters`, 3200);
                    return;
                }

                sys.socket.emit("changepassword", { token: webid.token, password: inp.value, newpass: inp2.value });
            }, ok.main);
            sys.socket.on("changepassdone", async (token) => {
                await fs.write('/user/info/token', token);
                await wd.reboot();
            });
        }, userPane);
        tk.cb('b1 b2', 'Location', function () {
            app.settings.locset.init();
        }, userPane);
        tk.cb('b1 b2', 'Log out', function () {
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', menu);
            tk.p(`Are you sure?`, 'bold', menu);
            tk.p(`You'll need to log back in/create another account.`, undefined, menu);
            tk.cb('b1', 'Log out', async function () {
                await fs.del('/user/info/token');
                await fs.write('/user/info/name', 'User');
                wd.reboot();
            }, menu);
            tk.cb('b1', `Close`, () => ui.dest(dark), menu);
        }, userPane);
        tk.cb('b1', 'Back', () => ui.sw2(userPane, mainPane), userPane);
        // Access pane
        tk.p('Accessibility', undefined, accPane);
        const p2 = tk.c('div', accPane, 'list');
        const ok2 = tk.c('span', p2);
        ok2.innerText = "Font size ";
        tk.cb('b4', 'Big', async function () {
            wd.bgft();
            set.set('font', 'big');
        }, p2);
        tk.cb('b4', 'Normal', function () {
            wd.meft();
            set.set('font', 'normal');
        }, p2);
        tk.cb('b4', 'Small', function () {
            wd.smft();
            set.set('font', 'small');
        }, p2);

        const p3 = tk.c('div', accPane, 'list');
        const ok3 = tk.c('span', p3);
        ok3.innerHTML = `SFW mode (Filters text before it's seen to help stop things like <a href="https://www.gaggle.net/" target="_blank">this</a>) `;
        tk.cb('b4', 'No chances', async function () {
            sys.filter = true;
            sys.nc = true;
            set.set('filter', 'nc');
            wm.notif('No chances mode on!', `Text with filtered items simply won't be shown. WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b4', 'Filter', async function () {
            sys.filter = true;
            sys.nc = false;
            set.set('filter', 'true');
            wm.notif('SFW mode on!', `WebDesk browser isn't filtered, along with anything that's not text. Already shown text won't be filtered.`, undefined, undefined, true);
        }, p3);
        tk.cb('b4', 'Off', function () {
            sys.filter = false;
            sys.nc = false;
            set.del('filter');
            wm.snack('SFW mode turned off');
        }, p3);
        tk.p('Transparency/blur effects', undefined, accPane);
        const blurp = tk.p('', undefined, accPane);
        blurp.style = "display: flex; justify-content: space-between; padding: 0px; margin: 0px;";
        const blur1 = tk.cb('b1 b2', 'Disable', function () {
            set.set('blur', 'false');
            ui.cv('ui1', 'var(--ui2)');
            ui.cv('bl1', '0px');
            ui.cv('bl2', '0px');
        }, blurp);
        blur1.style = "flex: 1 1; margin-right: 1px !important;";
        const blur2 = tk.cb('b1 b2', 'Enable', async function () {
            await set.del('blur');
            const perf = await set.read('lowgfx');
            wd.blurcheck(perf);
            if (ui.light === false) {
                wd.dark();
            } else {
                wd.light();
            }
        }, blurp);
        blur2.style = "flex: 1 1; margin-left: 1px !important;";
        tk.cb('b1', 'Back', () => ui.sw2(accPane, mainPane), accPane);
        // App pane
        tk.cb('b1', 'Back', () => ui.sw2(appPane, mainPane), appPane);
        if (type === "usercfg") {
            ui.sw2(mainPane, userPane);
        }
    },
    winopt: async function (opt) {
        if (opt === "1") {
            while (sys.styleadded.length > 0) {
                sys.stylesheet.deleteRule(sys.styleadded.pop());
            }
            ui.cv('optrad', '0px');
            set.del('winopt');
        } else if (opt === "2") {
            while (sys.styleadded.length > 0) {
                sys.stylesheet.deleteRule(sys.styleadded.pop());
            }
            sys.styleadded.push(sys.stylesheet.insertRule('.tb { border: none !important; background-color: rgba(0, 0, 0, 0) !important; padding-left: 8px !important; padding-right: 8px !important; padding: 6px !important; }', sys.stylesheet.cssRules.length));
            sys.styleadded.push(sys.stylesheet.insertRule('.content { border-radius: var(--rad2) !important; background-color: var(--ui2) !important; padding: 6px !important; margin-top: 3px !important; }', sys.stylesheet.cssRules.length));
            sys.styleadded.push(sys.stylesheet.insertRule('.window { padding: 6px !important; }', sys.stylesheet.cssRules.length));
            ui.cv('optrad', 'var(--rad2)');
            set.set('winopt', '2');
        }
    },
    eraseassist: {
        runs: false,
        init: async function () {
            const yeah = await fs.read('/user/info/token');
            ui.play('/system/lib/other/error.wav');
            const dark = ui.darken();
            const menu = tk.c('div', dark, 'cm');
            const m1 = tk.c('div', menu);
            const m2 = tk.c('div', menu, 'hide');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', m1);
            tk.img('/system/lib/img/icons/pass.svg', 'setupi', m2);
            tk.p(`Are you sure?`, 'bold', m1);
            tk.p(`You're about to erase this WebDesk. This can't be undone, everything will be deleted forever.`, undefined, m1);
            if (yeah) {
                tk.cb('b1', 'Erase', () => ui.sw2(m1, m2), m1);
            } else {
                tk.cb('b1 nodont', 'Erase', function () {
                    ui.dest(dark);
                    fs.erase('reboot');
                }, m1);
            }
            tk.cb('b1', `Close`, () => ui.dest(dark), m1);
            tk.p(`Enter account password to confirm erase`, 'bold', m2);
            tk.p(`You're about to erase this WebDesk. This can't be undone, everything will be deleted forever.`, undefined, m2);
            const inp = tk.c('input', m2, 'i1');
            inp.placeholder = "Password here";
            inp.type = "password";
            tk.cb('b1 nodont', 'Erase', async function () {
                sys.socket.emit("erase", { token: webid.token, pass: inp.value });
            }, m2);
            tk.cb('b1', `Close`, () => ui.dest(dark), m2);
            sys.socket.on("greenlight", async () => {
                await fs.erase('reboot');
                ui.dest(dark);
            });
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
    wallpapers: {
        runs: false,
        init: async function () {
            let p;
            const ok = tk.mbw('Wallpapers (beta)', '480px', 'auto', true, undefined, undefined);
            let wallpapers = await fs.ls('/system/lib/img/wallpapers/current/');
            p = tk.p('Looking for duplicates...', undefined, ok.main);
            for (const wallpaper of wallpapers.items) {
                if (wallpaper.type === "file") {
                    const defaultWallpaper = await fs.read('/system/lib/img/wallpapers/restore/default');
                    const currentWallpaper = await fs.read(wallpaper.path);
                    const speedy = Math.floor(defaultWallpaper.length * 0.2);

                    if (defaultWallpaper.slice(0, speedy) === currentWallpaper.slice(0, speedy) && wallpaper.path !== '/system/lib/img/wallpapers/current/wall') {
                        await fs.del(wallpaper.path);
                        wallpapers = await fs.ls('/system/lib/img/wallpapers/current/');
                    }
                }
            }

            const grid = tk.c('div', ok.main, 'brick-layout-list');
            let currentPage = 0;
            const itemsPerPage = 2;

            async function renderPage(page) {
                grid.innerHTML = '';
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = wallpapers.items.slice(start, end);

                for (const wallpaper of pageItems) {
                    if (wallpaper.type === "file") {
                        console.log('<!> Loading');
                        const img = tk.c('div', grid, 'wallpapericon');
                        const navi = tk.c('div', img, 'wallpapericonnav left');
                        const thing = await fs.read(wallpaper.path);
                        navi.style = "padding: 4px; margin: 4px; background-color: var(--ui1); box-sizing: border-box; border-radius: var(--rad2); backdrop-filter: blur(var(--bl2)); -webkit-backdrop-filter: blur(var(--bl2));";
                        tk.cb('b4', 'Delete', async function () {
                            await fs.del(wallpaper.path);
                            ui.slidehide(img);
                            const index = wallpapers.items.indexOf(wallpaper);
                            if (index > -1) {
                                wallpapers.items.splice(index, 1);
                            }
                        }, navi);
                        tk.cb('b4', 'Set', async function () {
                            await fs.del(wallpaper.path);
                            wd.setwall(thing, true, false);
                            ok.closebtn.click();
                        }, navi);
                        img.style.backgroundImage = `url(${thing})`;
                    }
                }
            }

            const nav = tk.c('div', ok.main, 'nav-buttons');
            nav.style.marginTop = "4px";
            tk.cb('b1', 'Back', async function () {
                if (currentPage > 0) {
                    currentPage--;
                    await renderPage(currentPage);
                }
            }, nav);
            tk.cb('b1', 'Forward', async function () {
                if ((currentPage + 1) * itemsPerPage < wallpapers.items.length) {
                    currentPage++;
                    await renderPage(currentPage);
                }
            }, nav);
            /* tk.cb('b1', 'Refresh', async function () {
                wallpapers.items = (await fs.ls('/system/lib/img/wallpapers/current/')).items;
                await renderPage(currentPage);
            }, nav); */
            renderPage(currentPage);
            ui.dest(p, 0);
        }
    },
};