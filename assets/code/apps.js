var app = {
    settings: {
        runs: true,
        name: 'Settings',
        init: async function () {
            const main = tk.mbw('Settings', '300px', 'auto', true, undefined, undefined);
            const generalPane = tk.c('div', main.main, 'hide');
            const appearPane = tk.c('div', main.main, 'hide');
            const accPane = tk.c('div', main.main, 'hide');
            const userPane = tk.c('div', main.main, 'hide');
            const appPane = tk.c('div', main.main, 'hide');
            tk.p('App Management', undefined, appPane);
            const shitStain = tk.c('div', appPane);
            const mainPane = tk.c('div', main.main);
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
                const data = await fs.read('/system/apps.json');
                if (data) {
                    const parsed = JSON.parse(data);
                    parsed.forEach((entry) => {
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
                            tk.cb('b1', 'Close', function () {
                                ui.dest(ok);
                            }, ok)
                        }, notif);
                        tk.cb('b3', 'Remove', async function () {
                            const updatedApps = parsed.filter(item => item.appid !== entry.appid);
                            const updatedData = JSON.stringify(updatedApps);
                            await fs.write('/system/apps.json', updatedData);
                            await fs.del(entry.exec);
                            ui.dest(notif);
                            wm.notif('Removed ' + entry.name, `It's been removed, but a reboot is needed to clear it completely.`, function () {
                                wd.reboot();
                            }, 'Reboot', true);
                            delete app[entry.appid];
                        }, notif);
                    });
                }
            }, mainPane);
            tk.cb('b1 b2', 'Personalize', () => ui.sw2(mainPane, appearPane), mainPane);
            // General pane
            tk.p('General', undefined, generalPane);
            tk.cb('b1 b2 red', 'Erase This WebDesk', () => app.eraseassist.init(), generalPane);
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
                    tk.p(`WARNING: Developer Mode lets you install third-party apps, and enables dev tools, but removes security protections.`, undefined, pane);
                    tk.p(`Use caution, there's no support for issues relating to Developer Mode. Disabling Developer Mode will erase WebDesk, but will keep your files.`, undefined, pane);
                    tk.cb(`b1`, 'Cancel', () => ui.dest(win), pane);
                    tk.cb(`b1`, 'Enable (reboot)', async function () {
                        await fs.write(`/system/info/devmode`, 'true');
                        await wd.reboot();
                    }, pane);
                } else {
                    tk.p(`Developer Mode is enabled.`, undefined, pane);
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
            const pgfx = tk.c('div', generalPane, 'list');
            const okgfx = tk.c('span', pgfx);
            okgfx.innerText = "Performance mode ";
            tk.cb('b7', 'On', async function () {
                wm.notif('Performance mode on', `Reboot to apply changes.`, function () {
                    wd.reboot();
                }, 'Reboot', true);
                await fs.write('/system/info/lowgfx', 'true');
            }, pgfx);
            tk.cb('b7', 'Off', async function () {
                wm.notif('Performance mode off', `Reboot to apply changes.`, function () {
                    wd.reboot();
                }, 'Reboot', true);
                await fs.del('/system/info/lowgfx');
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
                wd.notifsrc('/assets/other/notif1.ogg', true);
            }, p4);
            tk.cb('b7', '2', async function () {
                wd.notifsrc('/assets/other/notif2.ogg', true);
            }, p4);
            tk.cb('b7', '3', async function () {
                wd.notifsrc('/assets/other/notif3.ogg', true);
            }, p4);
            tk.cb('b7', '4', async function () {
                wd.notifsrc('/assets/other/notif4.ogg', true);
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
            tk.cb('b1 b2', 'Location Settings', function () {
                app.locset.init();
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
            tk.cb('b1', 'Remove All', () => wm.wal(`<p>Warning: Removing all App Market apps will cause a reboot and delete them, but their data will remain.</p>`, async function () {
                await fs.del('/system/apps.json');
                await fs.delfold('/system/apps');
                wd.reboot();
            }, 'Okay'), appPane);
            tk.cb('b1', 'Back', () => ui.sw2(appPane, mainPane), appPane);
        }
    },
    eraseassist: {
        runs: false,
        init: function () {
            ui.play('./assets/other/error.ogg');
            wm.wal(`<p>Warning: Erasing this WebDesk will destroy all data stored on it, this cannot be undone!</p>`, () => fs.erase('reboot'), 'Erase');
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
            const mousedownevent = new MouseEvent('mousedown');
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
                const data = await wd.savecity();
                const hawktuah = Date.now();
                await fs.write('/user/info/location.json', [{ city: data.location, unit: data.unit, lastupdate: hawktuah, default: false }]);
                sys.city = data.location;
                sys.unit = data.unit;
                sys.loclast = hawktuah;
                sys.defaultloc = false;
                if (ok.unit === "Metric") {
                    sys.unitsym = "°C";
                } else {
                    sys.unitsym = "°F";
                }
                ok.closebtn.dispatchEvent(mousedownevent);
                wm.snack(`New location: ${data.location}`);
            }, ok.main);
        }
    },
    echodesk: {
        runs: false,
        init: function () {
            const main = tk.c('div', tk.g('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Force Exit', () => wm.wal(`<p>If WebDesk is stuck, use this to leave.</p><p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`, () => reboot(), 'Force Exit'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/first.svg', 'setupi', first);
            tk.p('In EchoDesk Mode', 'h2', first);
            tk.p(`Use the ID below/scan the QR code to start your WebDesk on another WebDesk. The other WebDesk will have full access to your files.`, undefined, first);
            const split = tk.c('div', first, 'split');
            const id = tk.c('div', split, 'splititem');
            tk.p('--------', 'h2 deskid', id);
            sys.model = tk.p(`Most recent file action will show here`, 'greyp', id);
            tk.cb('b1', `Exit EchoDesk`, () => wd.reboot(), id);
            const ok = tk.c('div', split, 'splititem');
            var qrcode = new QRCode(ok, {
                text: `${window.location.origin}/echodesk.html?deskid=${sys.deskid}`,
                width: 128,
                height: 128,
                colorDark: "#ffffff",
                colorLight: "#000000",
                correctLevel: QRCode.CorrectLevel.M
            });
            setTimeout(function () {
                qrcode.clear();
                qrcode.makeCode(`${window.location.origin}/echodesk.html?deskid=${sys.deskid}`);
            }, 2000);
            sys.setupd = "echo";
        }
    },
    recovery: {
        runs: false,
        init: async function () {
            const id = gen(7);
            await ptp.go(id);
            ui.crtheme('#010101', true);
            wd.dark('nosave');
            await fs.del('/system/migval');
            ui.hide(tk.g('death'), 200);
            const main = tk.c('div', tk.g('setuparea'), 'setupbox');
            // HAHAHAHAHA FUNNY NUMBER!!!!
            main.style.height = "420px";
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Force Exit', () => wm.wal(`<p>If WebDesk is stuck, use this to leave.</p><p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`, () => reboot(), 'Force Exit'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/first.svg', 'setupi', first);
            tk.p('Recovery', 'h2', first);
            tk.p(`WebDesk couldn't boot or you wanted to come here, so we threw you here. Here's your options:`, undefined, first);
            tk.cb('b1 b2', `Half-boot (Lets you use WebDesk, but won't fix your problem)`, function () {
                wd.desktop('Half-boot', id, undefined);
                ui.dest(main, 200);
                app.ach.unlock('Maximum effort...?', `Recovery Mode exists for a reason.`);
            }, first);
            tk.cb('b1 b2', 'Delete Apps (Usually the main issue, your data will remain)', function () {
                fs.del('/system/apps.json');
                fs.delfold('/system/apps');
                wm.notif(`Deleted apps`, 'All apps were deleted, their data is safe.', undefined, undefined, true);
            }, first);
            tk.cb('b1 b2', 'Files (Wanna go digging or editing?)', () => app.files.init(), first);
            tk.cb('b1 b2', 'Settings (Self-explanatory)', () => app.settings.init(), first);
            tk.cb('b1', 'Exit Recovery', () => wd.reboot(), first);
            app.ach.unlock('Recovery', `Bad decisions probably led you here.`);
        }
    },
    setup: {
        runs: false,
        init: function () {
            const main = tk.c('div', tk.g('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Start Over', () => fs.erase('reboot'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/first.svg', 'setupi', first);
            tk.p('Welcome to WebDesk!', 'h2', first);
            tk.cb('b1', `EchoDesk`, function () {
                const echotemp = tk.c('div', main, 'setb hide');
                tk.img('./assets/img/setup/quick.png', 'setupi', echotemp);
                tk.p('EchoDesk', 'h2', echotemp);
                tk.p(`Enter the EchoDesk ID, and hit "Okay" to connect to the other WebDesk.`, undefined, echotemp);
                const input = tk.c('input', echotemp, 'i1');
                input.placeholder = "Enter EchoDesk ID";
                tk.cb('b1', 'Back', () => ui.sw2(echotemp, first), echotemp); tk.cb('b1', 'Okay', () => window.location.href = "./echodesk.html?deskid=" + input.value, echotemp);
                ui.sw2(first, echotemp);
            }, first);
            tk.cb('b1', `Guest`, function () {
                sys.guest = true;
                sys.name = "Guest";
                wd.desktop('Guest', gen(8));
                fs.write('/user/files/Welcome to WebDesk!.txt', `Welcome to WebDesk! This is your Files folder, where things you upload are stored. Use the buttons at the top to navigate between folders.`);
                wm.notif('Welcome to WebDesk!', `You've logged in as a guest, so WebDesk will be erased on reload and some features won't be available.`);
            }, first);
            tk.cb('b1', `Let's go`, () => ui.sw2(first, transfer), first);
            // migrate menu
            const transfer = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/quick.png', 'setupi', transfer);
            tk.p('Quick Start', 'h2', transfer);
            tk.p('To copy your data, just scan the QR code, or open Data Assistant on the other WebDesk, hit "Migrate", and enter this code:', undefined, transfer);
            const split = tk.c('div', transfer, 'split');
            const id = tk.c('div', split, 'splititem');
            tk.p('--------', 'h2 deskid', id);
            sys.model = tk.p(`Waiting for other WebDesk to enter code`, undefined, id);
            tk.cb('b1', `No thanks`, () => ui.sw2(transfer, warn), id);
            const ok = tk.c('div', split, 'splititem');
            var qrcode = new QRCode(ok, {
                text: `${window.location.origin}?deskid=${sys.deskid}`,
                width: 128,
                height: 128,
                colorDark: "#ffffff",
                colorLight: "#000000",
                correctLevel: QRCode.CorrectLevel.M
            });
            setTimeout(function () {
                qrcode.clear();
                qrcode.makeCode(`${window.location.origin}?deskid=${sys.deskid}`);
            }, 2000);
            transfer.id = "quickstartwdsetup";
            // copying menu
            const copy = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/restore.svg', 'setupi', copy);
            tk.p('Restoring from other WebDesk', 'h2', copy);
            tk.p('Do not touch the other WebDesk, it could interrupt the copying process.', undefined, copy);
            tk.p(`It's normal for this to take an unreasonable amount of time sometimes.`, undefined, copy);
            el.migstat = tk.p('Starting...', 'restpg', copy);
            tk.cb('b1', 'Cancel', function () { fs.erase('reboot'); }, copy);
            copy.id = "quickstartwdgoing";
            // warn menu
            const warn = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/noround.png', 'setupi', warn);
            tk.p(`WebDesk Online services`, 'h2', warn);
            tk.p('WebDesk makes a DeskID for you. Others can use this ID to send you files or call you.', undefined, warn);
            tk.p(`Keep your WebDesk open when possible. <span class="bold">When WebDesk isn't open, anyone's able to take your DeskID and you can't receive things.</span> You are your own server.`, undefined, warn);
            tk.cb('b1', `What's my DeskID?`, function () {
                const box = wm.cm();
                tk.p(`Your DeskID is <span class="med">${sys.deskid}</span>. You'll need to finish setup to use it.`, undefined, box);
                tk.cb('b1', 'Got it', undefined, box);
            }, warn); tk.cb('b1', 'Got it', function () {
                const ua = navigator.userAgent;
                const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
                const safari = ua.includes('Safari') && !ua.includes('CriOS') && !ua.includes('FxiOS') && !ua.includes('EdgiOS');
                if (ios && safari && window.navigator.standalone !== false) {
                    const supportmsg = tk.c('div', document.body, 'cm');
                    tk.p('Install WebDesk as a web app?', 'bold', supportmsg);
                    tk.p('To install, tap the Share icon, scroll, hit "Add To Home Screen", and open the WebDesk app.', undefined, supportmsg);
                    tk.p('Installing WebDesk as one gives you more screen space, and a better experience.', undefined, supportmsg);
                    tk.cb('b1', 'No thanks', async function () {
                        await fs.write('/system/info/standalone', 'false');
                        ui.sw2(warn, user);
                    }, supportmsg)
                } else {
                    ui.sw2(warn, user);
                }
            }, warn);
            // user menu
            const user = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/user.svg', 'setupi', user);
            tk.p('Create User', 'h2', user);
            tk.p(`Data is stored on your device only. WebDesk does not collect any data from you. The name you enter is visible to anyone with your DeskID.`, undefined, user);
            const p = tk.c('div', user, 'list flexthing');
            const ok2 = tk.c('div', p, 'tnav');
            const p2 = tk.c('div', p, 'title');
            ok2.innerText = "Font size";
            ok2.style.marginLeft = "4px";
            p.style.marginBottom = "3px";
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
            const input = tk.c('input', user, 'i1');
            input.placeholder = "Enter a name to use with WebDesk";
            tk.cb('b1', 'Done!', function () {
                if (input.value.length > 14) {
                    wm.snack(`Set a name under 14 characters`, 3200);
                    return;
                }
                wd.finishsetup(input.value, user, sum);
            }, user);
            // summary
            const sum = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/check.svg', 'setupi', sum);
            tk.p('All done!', 'h2', sum);
            tk.p('Make sure to check Settings for more options.', undefined, sum);
            tk.cb('b1 rb', 'Erase & restart', function () { fs.erase('reboot'); }, sum); tk.cb('b1', 'Finish', function () { wd.reboot(); }, sum);
            sum.id = "setupdone";
        }
    },
    migrate: {
        runs: false,
        init: function (yeah) {
            const main = tk.c('div', tk.g('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Force Exit', () => wm.wal(
                `<p>If WebDesk is stuck, use this to leave.</p>
                <p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`,
                () => reboot(),
                'Force Exit'
            ), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // migration menu
            let transfer = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/quick.png', 'setupi', transfer);
            tk.p('Migration Assistant', 'h2', transfer);
            let [the, inp, stats] = [undefined];
            if (yeah === "skibidi") {
                stats = tk.p(`WARNING: Scanning someone else's code shares all your files and data with them.`, 'bold', transfer);
                tk.p(`If you scanned someone else's code, please hit "Cancel" to stop migration.`, undefined, transfer);
                the = sys.migrid;
            } else {
                stats = tk.p(`WARNING: Using someone else's code shares all your files and data with them.`, 'bold', transfer);
                inp = tk.c('input', transfer, 'i1');
                inp.placeholder = "Enter the code shown on the other WebDesk";
            }

            tk.cb('b1', `Cancel`, function () {
                wd.reboot();
            }, transfer);
            tk.cb('b1', 'OK, copy data!', async function () {
                stats.innerText = `Connecting to other WebDesk...`;

                if (inp) {
                    el.currentid = inp.value;
                    the = inp.value;
                }

                migrationgo(the, stats).then((result) => {
                    if (result === true) {
                        ui.sw2(transfer, sum);
                    } else {
                        wm.wal(`<p>Data Assistant couldn't communicate with the other WebDesk</p>`,
                            () => wd.reboot(), 'Reboot Now');
                        console.log(`<!> Data Assistant Error: ${result}`);
                    }
                }).catch((error) => {
                    wm.wal(`<p>Data Assistant encountered an error</p>`,
                        () => reboot(), 'Reboot Now');
                    console.log('<!> ' + error);
                });

                setTimeout(function () {
                    if (stats.innerText === `Connecting to other WebDesk...`) {
                        wm.wal(`<p>Couldn't connect to other WebDesk, try these things to fix it:</p>
                        <li>Check your Internet connection</li>
                        <li>Disable your VPN temporarily, then reload both WebDesks</li>
                        <li>Reload the other WebDesk first, then this one second</li>`);
                    }
                }, 9000);
            }, transfer);
            transfer.id = "quickstartwdsetup";
            // summary
            const sum = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/check.svg', 'setupi', sum);
            tk.p('Finishing Up', 'h2', sum);
            tk.p(`Wait for the other WebDesk to finish before hitting "Done" or "Erase".`, undefined, sum);
            tk.p(`It's normal for this to take an unreasonable amount of time sometimes.`, undefined, sum);
            tk.cb('b1', 'Erase', function () { app.eraseassist.init(); }, sum);
            tk.cb('b1', 'Done', function () { wd.reboot(); }, sum);
            sum.id = "setupdone";
        }
    },
    imgview: {
        runs: false,
        name: 'Iris',
        init: async function (contents) {
            const win = tk.mbw('Iris', '400px', 'auto', undefined, undefined, undefined);
            if (contents.includes('data:image')) {
                const container = tk.c('div', win.main);
                container.style.marginBottom = "4px";
                const img = tk.c('img', container, 'embed');
                img.src = contents;
                let cropperinstance = null;
                function cropbtn() {
                    const cropButton = tk.cb('b1', 'Crop', function () {
                        if (!cropperinstance) {
                            cropButton.innerText = "Cancel";
                            cropperinstance = new Cropper(img);

                            const preview = tk.cb('b1', 'Preview', async function () {
                                const croppedimg = getCroppedImage();
                                app.imgview.init(croppedimg);
                            }, win.main);

                            const savebutton = tk.cb('b1', 'Save', async function () {
                                const croppedimg = getCroppedImage();
                                const skibidi = await app.files.pick('new', 'Save crop as');
                                await fs.write(skibidi + ".png", croppedimg);
                                wm.snack('Saved as ' + skibidi + ".png");
                                cropperinstance.destroy();
                                cropperinstance = null;
                                cropButton.innerText = "Crop";
                                savebutton.remove();
                                preview.remove();
                            }, win.main);

                            function getCroppedImage() {
                                const croppedCanvas = cropperinstance.getCroppedCanvas();
                                return croppedCanvas.toDataURL('image/png');
                            }
                        } else {
                            cropperinstance.destroy();
                            cropperinstance = null;
                            cropButton.innerText = "Crop";

                            const buttons = win.main.querySelectorAll('button');
                            buttons.forEach(button => {
                                if (button.innerText === "Save" || button.innerText === "Preview") {
                                    button.remove();
                                }
                            });
                        }
                    }, win.main);
                }

                win.closebtn.addEventListener('click', () => {
                    if (cropperinstance) {
                        cropperinstance.destroy();
                        cropperinstance = null;
                    }
                });
                cropbtn();
            } else if (contents.includes('data:video')) {
                const img = tk.c('video', win.main, 'embed');
                const src = tk.c('source', img);
                src.src = contents;
                img.controls = true;
            } else if (contents.includes('data:application/x-zip-')) {
                win.win.style.width = "300px";
                const base64Data = contents.split(',')[1];
                const binaryData = atob(base64Data);
                const uint8Array = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                }
                const zip = new JSZip();
                const zipContent = await zip.loadAsync(uint8Array);
                tk.p('ZIP file', 'h2', win.main);
                tk.p(`ZIP files are read-only for the time being.`, undefined, win.main);
                let div = tk.c('div', win.main);
                zipContent.forEach((relativePath, zipEntry) => {
                    tk.cb('flist', relativePath, async function () {
                        wm.snack('ZIP files are read-only for now.');
                    }, div);
                });
            } else if (contents.includes('data:application/pdf')) {
                wm.notif(`WebDesk can't view PDFs`, 'Open PDF in a new tab?', () => window.open(contents, '_blank'), undefined, true);
            }
        }
    },
    textedit: {
        runs: true,
        name: 'TextEdit',
        init: async function (contents, path, readonly) {
            if (readonly !== true) {
                if (!path) {
                    const path2 = await app.files.pick('new', 'Create new document/code');
                    if (path2 !== false) {
                        app.textedit.init('', path2);
                    }
                    return;
                }
            }
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw('TextEdit', '500px', '340px');
            const tabs = tk.c('div', win.main, 'd');
            tabs.style.flex = "0 0 auto";
            tabs.appendChild(win.title);
            win.closebtn.style.marginLeft = "2px";
            const editdiv = tk.c('div', win.main, 'browsertab');
            editdiv.style.display = "block";
            editdiv.style.borderRadius = "0px";
            win.name.innerHTML = "";
            win.main.classList = "browsercont";
            const genit = gen(8);
            editdiv.id = genit;
            const editor = ace.edit(`${genit}`);
            editor.setOptions({
                fontFamily: "MonoS",
                fontSize: "var(--fz3)",
                wrap: true,
            });
            function ok() {
                if (ui.light === true) {
                    editor.setTheme(null);
                } else {
                    editor.setTheme("ace/theme/monokai");
                }
            }
            ok();
            const colorch = setInterval(() => {
                ok();
            }, 700);
            editor.setValue(contents, -1);
            async function save() {
                const newContents = editor.getValue();
                await fs.write(path, newContents);
                wm.snack('Saved');
            }
            if (readonly !== true) {
                tk.cb('b4 b6', 'Save', async function () {
                    await save();
                }, win.name);
            } else {
                tk.cb('b4 b6', 'Save', async function () {
                    const path = await app.files.pick('new', 'Save in new file');
                    const newContents = editor.getValue();
                    fs.write(path, newContents);
                    wm.snack('Saved');
                }, win.name);
                editor.setReadOnly(true);
            }
            tk.cb('b4 b6', 'Menu', async function () {
                const menu = tk.c('div', document.body, 'cm');
                if (readonly !== true) {
                    tk.p('Editing ' + path, 'bold', menu);
                } else {
                    tk.p('Read-only text', 'bold', menu);
                }
                tk.cb('b1 b2', 'Select All', function () {
                    editor.selectAll();
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1 b2', 'Find Text', function () {
                    editor.execCommand('find');
                    ui.dest(menu, 120);
                }, menu);
                if (readonly !== true) {
                    tk.cb('b1 b2', 'Replace', function () {
                        editor.execCommand('replace');
                        ui.dest(menu, 120);
                    }, menu);
                    tk.cb('b1', 'Undo', function () {
                        editor.execCommand('undo');
                    }, menu);
                }
                tk.cb('b1', 'Close', function () {
                    ui.dest(menu, 120);
                }, menu);
                if (readonly !== true) {
                    tk.cb('b1', 'Redo', function () {
                        editor.execCommand('redo');
                    }, menu);
                }
            }, win.name);
            function runc() {
                const menu = tk.c('div', document.body, 'cm');
                if (sys.dev === true) {
                    tk.p(`WAIT!!!`, 'h2', menu);
                    tk.p(`RUN THIS CODE CAREFULLY. It will have full access to your data. It's safer to use an incognito window, if possible. If you were told to copy/paste something here, you're probably getting scammed.`, undefined, menu);
                    tk.cb('b1 b2', 'I understand, run the code', function () {
                        ui.dest(menu, 120);
                        eval(editor.getValue());
                    }, menu);
                } else {
                    tk.p(`Enable Developer Mode in Settings -> General to run custom code.`, undefined, menu);
                }
                tk.cb('b1', 'Close', function () {
                    ui.dest(menu, 120);
                }, menu);
            }
            tk.cb('b4 b6', 'Run', async function () {
                runc();
            }, win.name);
            wd.win();
            if (readonly !== true) {
                editor.container.addEventListener('keydown', async function (event) {
                    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                        event.preventDefault();
                        await save();
                    }
                });
                editor.container.addEventListener('keydown', async function (event) {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                        event.preventDefault();
                        await runc();
                    }
                });
            }
            new ResizeObserver(() => {
                editor.resize();
            }).observe(win.win);
        }
    },
    files: {
        runs: true,
        name: 'Files',
        init: async function () {
            const win = tk.mbw(`Files`, '340px', 'auto', true, undefined, undefined);
            const search = tk.c('input', win.main, 'i1');
            win.name.innerHTML = "";
            const breadcrumbs = tk.c('div', win.name);
            search.style.marginBottom = "5px";
            const items = tk.c('div', win.main);
            if (sys.mobui === true) {
                items.style.maxHeight = screen.height - 180 + "px";
            } else {
                items.style.maxHeight = "370px";
            }
            items.style.overflow = "auto";
            items.style.borderRadius = "12px";
            items.style.padding = "6px";
            items.style.paddingTop = "0px";
            win.main.style.padding = "8px";
            let items2;
            search.placeholder = "Search for a file...";
            search.addEventListener('input', function (event) {
                const searchText = search.value.toLowerCase();
                items2.forEach(item => {
                    const itemText = item.textContent.toLowerCase();
                    if (itemText.includes(searchText)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
            function clr() {
                items2.forEach(item => {
                    item.style.display = 'block';
                });
                search.value = "";
            }
            search.addEventListener('blur', () => {
                clr();
            });
            search.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    clr();
                }
            });
            search.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    const visible = Array.from(items2).filter(item => item.style.display !== 'none');
                    if (visible.length === 1) {
                        visible[0].click();
                    }
                }
            });
            var currentPath = undefined;
            let dragoverListener = null;
            let dropListener = null;

            async function navto(path) {
                items.innerHTML = "";
                breadcrumbs.innerHTML = "";
                let crumbs = path.split('/').filter(Boolean);
                let tempPath = '/';

                tk.cb('flist flists', 'Root', () => navto('/'), breadcrumbs);
                crumbs.forEach((crumb, index) => {
                    tempPath += crumb + '/';
                    tk.cb('flists', '/', undefined, breadcrumbs);
                    tk.cb('flist flists', crumb, () => navto('/' + crumbs.slice(0, index + 1).join('/') + "/"), breadcrumbs);
                });

                currentPath = tempPath;

                if (dragoverListener) items.removeEventListener('dragover', dragoverListener);
                if (dropListener) items.removeEventListener('drop', dropListener);

                dragoverListener = e => e.preventDefault();
                dropListener = async e => {
                    e.preventDefault();
                    const text = e.dataTransfer.getData('text/plain');
                    const fileData = await fs.read(text);
                    const relativePath = text.split('/').pop();
                    await fs.write(currentPath + relativePath, fileData);
                    setTimeout(() => navto(currentPath), 300);
                };

                items.addEventListener('dragover', dragoverListener);
                items.addEventListener('drop', dropListener);

                const contents = await fs.ls(path);
                contents.items.forEach(item => {
                    if (item.type === "folder") {
                        const folder = tk.cb('flist width', "Folder: " + item.name, () => navto(item.path + "/"), items);
                        let isLongPress = false;
                        let timer;

                        function openmenu() {
                            if ((item.path.includes('/system') || item.path.includes('/user/info')) && sys.dev === false) {
                                wm.snack('Enable Developer Mode to modify this folder.', 6000);
                                return;
                            }

                            const menu = tk.c('div', document.body, 'cm');
                            const p = tk.ps(item.path, 'bold', menu);
                            p.style.marginBottom = "7px";
                            if (item.path.includes('/system') || item.path.includes('/user/info')) {
                                tk.p('Important folder, modifying it could cause damage.', 'warn', menu);
                            }
                            tk.cb('b1 b2', 'Delete folder', () => {
                                fs.delfold(item.path);
                                ui.dest(folder);
                                ui.dest(menu);
                            }, menu);
                            tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                        }

                        folder.addEventListener('touchstart', e => {
                            e.preventDefault();
                            isLongPress = false;
                            timer = setTimeout(() => {
                                isLongPress = true;
                                openmenu();
                            }, 500);
                        });
                        folder.addEventListener('touchend', () => {
                            clearTimeout(timer);
                            if (!isLongPress) {
                                navto(item.path + "/");
                            }
                        });
                        folder.addEventListener('touchmove', () => clearTimeout(timer));
                        folder.addEventListener('touchcancel', () => clearTimeout(timer));
                        folder.addEventListener('contextmenu', e => {
                            e.preventDefault();
                            openmenu();
                        });
                    } else {
                        if (item.name === "") return;

                        const fileItem = tk.cb('flist width', "File: " + item.name, async function () {
                            if (!sys.dev && item.path.includes('/system') || item.path.includes('/user/info') && sys.dev === false) {
                                wm.snack('Enable Developer Mode to modify system files.', 6000);
                                return;
                            }

                            const skibidi = tk.c('div', document.body, 'cm');
                            skibidi.innerText = `Loading ${item.name}, this might take a bit`;
                            const filecontent = await fs.read(item.path);
                            const menu = tk.c('div', document.body, 'cm');
                            const p = tk.ps(item.path, 'bold', menu);
                            p.style.marginBottom = "7px";

                            if (item.path.includes('/system') || item.path.includes('/user/info')) {
                                tk.p('Important file, modifying it could cause damage.', 'warn', menu);
                            }
                            if (item.path.includes('/user/info/name')) {
                                tk.p('Deleting this file will erase your data on next restart.', 'warn', menu);
                            }
                            if (!filecontent.includes('data:video')) {
                                if (filecontent.includes('data:')) {
                                    const thing = tk.img(filecontent, 'embed', menu, false);
                                    thing.style.marginBottom = "4px";
                                } else {
                                    const thing = tk.c('div', menu, 'embed resizeoff');
                                    const genit = gen(8);
                                    thing.id = genit;
                                    const editor = ace.edit(`${genit}`);
                                    editor.setOptions({
                                        fontFamily: "MonoS",
                                        fontSize: "9px",
                                        wrap: true,
                                    });
                                    if (ui.light !== true) editor.setTheme("ace/theme/monokai");
                                    thing.style.marginBottom = "4px";
                                    thing.style.height = "130px";
                                    editor.resize();
                                    editor.setValue(filecontent, -1);
                                    editor.setReadOnly(true);
                                }
                            }

                            const btnmenu = tk.c('div', menu, 'brick-layout');
                            btnmenu.style.marginBottom = "4px";

                            tk.cb('b3', 'Open', async function () {
                                if (filecontent.includes('data:')) {
                                    app.imgview.init(filecontent);
                                } else {
                                    app.textedit.init(filecontent, item.path);
                                }
                                ui.dest(menu);
                            }, btnmenu);
                            tk.cb('b3', 'Open with', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const btnmenu2 = tk.c('div', menu2, 'brick-layout');
                                btnmenu.style.marginBottom = "4px";
                                tk.cb('b3', 'Iris Media Viewer', function () {
                                    app.imgview.init(filecontent);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Text Editor', function () {
                                    app.textedit.init(filecontent, item.path);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Weather Archive', function () {
                                    app.wetter.init(true, filecontent);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'console.log', function () {
                                    console.log(filecontent);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                            }, btnmenu);
                            tk.cb('b3', 'Download', () => {
                                wd.download(filecontent, `WebDesk File ${gen(4)}`);
                                ui.dest(menu);
                            }, btnmenu);
                            tk.cb('b3', 'WebDrop', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const input = tk.c('input', menu2, 'i1');
                                input.placeholder = "Enter DeskID";
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                                tk.cb('b1', 'WebDrop', async function () {
                                    menu2.innerHTML = `<p class="bold">Sending file</p><p>Depending on the size, this might take a bit</p>`;
                                    tk.cb('b1', 'Close (No status updates)', () => ui.dest(menu2), menu2);
                                    await custf(input.value, item.name, filecontent).then(success => {
                                        menu2.innerHTML = success
                                            ? `<p class="bold">File sent</p><p>The other person can accept or deny</p>`
                                            : `<p class="bold">An error occurred</p><p>Make sure the ID is correct</p>`;
                                        tk.cb('b1', 'Close', () => ui.dest(menu2), menu2);
                                    });
                                }, menu2);
                            }, btnmenu);
                            tk.cb('b3', 'Rename/Move', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const input = tk.c('input', menu2, 'i1');
                                input.placeholder = "Enter new path";
                                input.value = item.path;
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                                tk.cb('b1', 'Rename/Move', () => {
                                    fs.write(input.value, filecontent);
                                    fs.del(item.path);
                                    navto(path);
                                    ui.dest(menu2);
                                }, menu2);
                            }, btnmenu);
                            tk.cb('b3', 'Delete file', () => {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                tk.ps('Are you sure you want to delete ' + item.path + '?', undefined, menu2);
                                tk.ps(`This cannot be undone!`, undefined, menu2);
                                tk.cb('b1', 'Delete file', () => {
                                    fs.del(item.path);
                                    ui.dest(fileItem);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                            }, btnmenu);
                            tk.cb('b1', 'Cancel', () => ui.dest(menu), menu);
                            ui.dest(skibidi);
                        }, items);

                        fileItem.addEventListener('dragstart', e => {
                            e.dataTransfer.setData('text/plain', item.path);
                        });
                        fileItem.draggable = true;
                        let isLongPress = false;
                        let timer;

                        async function openmenu() {
                            const menu2 = tk.c('div', document.body, 'cm');
                            const date = await fs.date(item.path);
                            tk.p(`<span class="bold">Created</span> ${wd.timec(date.created)}`, undefined, menu2);
                            tk.p(`<span class="bold">Edited</span> ${wd.timec(date.edit)}`, undefined, menu2);
                            tk.p(`<span class="bold">Read</span> ${wd.timec(date.read)}`, undefined, menu2);
                            tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                        }

                        fileItem.addEventListener('touchstart', e => {
                            e.preventDefault();
                            isLongPress = false;
                            timer = setTimeout(() => {
                                isLongPress = true;
                                openmenu();
                            }, 500);
                        });
                        fileItem.addEventListener('touchend', () => {
                            clearTimeout(timer);
                            if (!isLongPress) {
                                fileItem.click();
                            }
                        });
                        fileItem.addEventListener('touchmove', () => clearTimeout(timer));
                        fileItem.addEventListener('touchcancel', () => clearTimeout(timer));
                        fileItem.addEventListener('contextmenu', e => {
                            e.preventDefault();
                            openmenu();
                        });
                    }
                });
                items2 = items.querySelectorAll('.flist');
            }

            navto('/user/files/');
        },
        pick: function (type, text) {
            return new Promise(async (resolve, reject) => {
                let win = {};
                win.win = tk.c('div', document.body, 'cm');
                tk.p(text, 'bold', win.win);
                const breadcrumbs = tk.c('div', win.win);
                win.main = tk.c('div', win.win, 'embed nest');
                win.win.style.background = "var(--ui3)";
                win.win.style.width = "300px";
                win.main.style.height = "300px";
                win.main.style.overflow = "auto";
                win.main.style.marginBottom = "5px";
                win.main.style.marginTop = "5px";
                const items = tk.c('div', win.main);
                let selectedPath = undefined;

                async function navto(path) {
                    items.innerHTML = "";
                    breadcrumbs.innerHTML = "";
                    let crumbs = path.split('/').filter(Boolean);
                    let currentPath = '/';

                    tk.cb('flist', 'Root', () => navto('/'), breadcrumbs);

                    crumbs.forEach((crumb, index) => {
                        currentPath += crumb + '/';
                        tk.cb('flists', '/', undefined, breadcrumbs);
                        tk.cb('flist', crumb, () => navto('/' + crumbs.slice(0, index + 1).join('/') + "/"), breadcrumbs);
                    });

                    selectedPath = currentPath;
                    const thing = await fs.ls(path);
                    thing.items.forEach(function (thing) {
                        if (thing.type === "folder") {
                            const target = tk.cb('flist width', "Folder: " + thing.name, () => navto(thing.path + "/"), items);
                        } else {
                            if (thing.name == "") {
                                return;
                            }
                            const target = tk.cb('flist width', "File: " + thing.name, async function () {
                                if (type !== "new") {
                                    const menu = tk.c('div', document.body, 'cm');
                                    tk.p(thing.path, 'bold', menu);
                                    tk.cb('b1', 'Cancel', function () {
                                        ui.dest(menu);
                                    }, menu);
                                    tk.cb('b1', 'Choose', function () {
                                        ui.dest(menu); ui.dest(win.win);
                                        if (thing.path.includes('/system') || thing.path.includes('/user/info')) {
                                            if (sys.dev === false) {
                                                wm.snack(`Enable Developer Mode to make or edit files here.`);
                                                return;
                                            }
                                        }
                                        resolve(thing.path);
                                    }, menu);
                                }
                            }, items);
                        }
                    });
                }
                let inp;
                if (type === "new") {
                    inp = tk.c('input', win.win, 'i1');
                    inp.placeholder = "File name here";
                }

                tk.cb('b1', 'Close', function () {
                    ui.dest(win.win);
                    reject(false);
                }, win.win);

                if (type === "new") {
                    tk.cb('b1', 'Random name', function () {
                        inp.value = gen(8);
                    }, win.win);
                    tk.cb('b1', 'New file', function () {
                        if (inp.value === "") {
                            wm.snack('Enter a filename.');
                        } else {
                            if (selectedPath.includes('/system') || selectedPath.includes('/user/info')) {
                                if (sys.dev === false) {
                                    wm.snack(`Enable Developer Mode to make or edit files here.`);
                                    return;
                                }
                            }
                            resolve(selectedPath + inp.value);
                            ui.dest(win.win);
                        }
                    }, win.win);
                }

                navto('/user/files/');
            });
        }
    },
    webcomm: {
        runs: true,
        name: "WebComm",
        init: async function () {
            const win = tk.mbw('WebComm', '320px', 'auto', true);
            const inp = tk.c('input', win.main, 'i1');
            inp.placeholder = "Enter a DeskID";
            const skibidiv = tk.c('div', win.main);
            let extraid = undefined;
            const dropbtn = tk.cb('b1', 'WebDrop', async function () {
                if (inp.value === sys.deskid) {
                    wm.snack(`Type a DeskID that isn't yours.`);
                    app.ach.unlock('So lonely...', 'So lonely, you tried calling yourself.');
                } else {
                    const file = await app.files.pick(undefined, 'Select file to send');
                    const menu2 = tk.c('div', document.body, 'cm');
                    menu2.innerHTML = `<p class="bold">Sending file</p><p>Depending on the size, this might take a bit</p>`;
                    tk.cb('b1', 'Close (No status updates)', () => ui.dest(menu2), menu2);

                    const filecont = await fs.read(file);
                    await custf(inp.value, file.substring(file.lastIndexOf('/') + 1), filecont).then(async success => {
                        await ptp.getname(inp.value)
                            .then(name => {
                                app.webcomm.add(inp.value, name);
                                menu2.innerHTML = success
                                    ? `<p class="bold">WebDrop complete</p><p>The other person can accept or deny</p>`
                                    : `<p class="bold">An error occurred</p><p>Make sure the ID is correct</p>`;

                                tk.cb('b1', 'Close', () => ui.dest(menu2), menu2);
                            })
                            .catch(error => {
                                if (extraid) {
                                    wm.snack(`First ID failed, trying their second ID...`);
                                    inp.value = extraid;
                                    dropbtn.click();
                                    extraid = undefined;
                                } else {
                                    console.log(error);
                                    wm.snack(`User isn't online or your Internet isn't working`);
                                    inp.value = "";
                                }
                            });
                    }, menu2);
                }
            }, win.main);
            const callbtn = tk.cb('b1', 'Call', async function () {
                if (inp.value === sys.deskid) {
                    wm.snack(`Type a DeskID that isn't yours.`);
                    app.ach.unlock('So lonely...', 'So lonely, you tried calling yourself.');
                } else {
                    await ptp.getname(inp.value)
                        .then(name => {
                            app.webcall.init(inp.value, name);
                        })
                        .catch(error => {
                            if (extraid) {
                                wm.snack(`First ID failed, trying their second ID...`);
                                inp.value = extraid;
                                callbtn.click();
                                extraid = undefined;
                            } else {
                                console.log(error);
                                wm.snack(`User isn't online or your Internet isn't working`);
                                inp.value = "";
                            }
                        });
                }
            }, win.main);
            const chatbtn = tk.cb('b1', 'Chat', async function () {
                if (inp.value === sys.deskid) {
                    wm.snack(`Type a DeskID that isn't yours.`);
                    app.ach.unlock('So lonely...', 'So lonely, you tried messaging yourself.');
                } else {
                    await ptp.getname(inp.value)
                        .then(name => {
                            app.webchat.init(inp.value, undefined, name);
                        })
                        .catch(error => {
                            if (extraid) {
                                wm.snack(`First ID failed, trying their second ID...`);
                                inp.value = extraid;
                                chatbtn.click();
                                extraid = undefined;
                            } else {
                                console.log(error);
                                wm.snack(`User isn't online or your Internet isn't working`);
                                inp.value = "";
                            }
                        });
                }
            }, win.main);
            async function ok() {
                const data = await fs.read('/user/info/contactlist.json');
                skibidiv.innerHTML = "";
                tk.cb('b3 b2 webcomm dash', 'Manage or edit contacts', () => app.contacts.init(), skibidiv);

                if (data) {
                    const parsed = JSON.parse(data);
                    const buttons = [];

                    for (const entry of parsed) {
                        let btn;
                        if (entry.name === entry.deskid) {
                            btn = tk.cb('b3 b2 webcomm', entry.deskid, function () {
                                inp.value = entry.deskid;
                                if (entry.deskid2) extraid = entry.deskid2;
                            }, skibidiv);
                        } else {
                            btn = tk.cb('b3 b2 webcomm', entry.name + " - " + entry.deskid + " | Loading", function () {
                                inp.value = entry.deskid;
                                if (entry.deskid2) extraid = entry.deskid2;
                            }, skibidiv);
                        }

                        buttons.push({ btn, deskid: entry.deskid, deskid2: entry.deskid2 });
                    }

                    await Promise.all(
                        buttons.map(async ({ btn, deskid, deskid2 }) => {
                            try {
                                await ptp.getname(deskid);
                                btn.innerText = ui.filter(btn.innerText.slice(0, -9) + " | Online");
                            } catch (error) {
                                if (deskid2 !== undefined) {
                                    try {
                                        await ptp.getname(deskid);
                                        btn.innerText = ui.filter(btn.innerText.slice(0, -9) + " | Online");
                                    } catch (error) {
                                        btn.innerText = ui.filter(btn.innerText.slice(0, -10) + " | Offline");
                                    }
                                } else {
                                    btn.innerText = ui.filter(btn.innerText.slice(0, -10) + " | Offline");
                                }
                            }
                        })
                    );
                }
            }
            const yeah = setInterval(() => ok(), 20000);
            await ok();
            win.closebtn.addEventListener('mousedown', function () {
                clearInterval(yeah);
            });
        },
        add: async function (deskid, name) {
            try {
                if (!name) {
                    name = deskid;
                }
                const data = await fs.read('/user/info/contactlist.json');
                if (data) {
                    const newen = { deskid: deskid, name: name, time: Date.now() };
                    const jsondata = JSON.parse(data);
                    const check = jsondata.some(entry => entry.deskid === newen.deskid);
                    if (check !== true) {
                        jsondata.push(newen);
                        fs.write('/user/info/contactlist.json', jsondata);
                    }
                } else {
                    await fs.write('/user/info/contactlist.json', [{ deskid: deskid, name: name, time: Date.now() }]);
                }
            } catch (error) {
                console.log(`<!> Couldn't add contact: `, error);
                return null;
            }
        }
    },
    webchat: {
        runs: false,
        init: async function (deskid, chat, name) {
            if (el.webchat !== undefined) {
                wd.win(el.webchat);
                el.currentid = deskid;
            } else {
                el.webchat = tk.mbw('WebChat', '300px', 'auto', true);
                let otherid = undefined;
                wc.messaging = tk.c('div', el.webchat.main);
                wc.chatting = tk.c('div', wc.messaging, 'embed nest');
                wc.chatting.style.overflow = "auto";
                wc.chatting.style.height = "400px";
                el.currentid = deskid;
                tk.ps(`Talking with ${name} - ${deskid}`, 'smtxt', wc.chatting);
                if (sys.filter === true) {
                    tk.ps(`PLEASE NOTE: Some filters can detect things YOU send, as they monitor your typing.`, 'smtxt', wc.chatting);
                }

                if (deskid && !chat) {
                    otherid = deskid;
                    el.currentid = deskid;
                }

                if (deskid) {
                    otherid = deskid;
                }

                wc.messagein = tk.c('input', wc.messaging, 'i1');
                wc.messagein.placeholder = "Message";

                function send() {
                    const msg = wc.messagein.value;
                    if (msg && otherid) {
                        custf(otherid, 'Message-WebKey', msg);
                        wc.sendmsg = tk.c('div', wc.chatting, 'msg mesent');
                        wc.sendmsg.innerText = ui.filter(`${sys.name}: ` + msg);
                        wc.sendmsg.style.marginBottom = "3px";
                        wc.messagein.value = '';
                        wc.chatting.scrollTop = wc.chatting.scrollHeight;
                    }
                }

                tk.cb('b1', 'Send', () => send(), wc.messaging);

                ui.key(wc.messagein, "Enter", () => send());
            }

            el.webchat.closebtn.addEventListener('mousedown', function () {
                el.webchat = undefined;
                custf(el.currentid, 'Message-WebKey', `End chat with ${el.currentid}`);
            });

            app.webcomm.add(deskid, name);

            return new Promise((resolve) => {
                let checkDeskAndChat = setInterval(() => {
                    if (typeof deskid === "string" && typeof chat === "string") {
                        clearInterval(checkDeskAndChat);
                        const msg = tk.c('div', wc.chatting, 'flist othersent');
                        msg.style.marginBottom = "3px";
                        msg.innerText = ui.filter(`${name}: ` + chat);
                        wc.chatting.scrollTop = wc.chatting.scrollHeight;
                        resolve();
                    }
                }, 100);
            });
        }
    },
    about: {
        runs: true,
        name: 'About',
        init: async function () {
            const win = tk.mbw('About', undefined, 'auto', true, undefined, undefined);
            tk.css('./assets/lib/abt.css');
            const main = tk.c('div', win.main, 'abtcont');
            const side = tk.c('div', main, 'abtlogo');
            const info = tk.c('div', main, 'abtinfo');
            const logo = tk.img('./assets/img/favicon.png', 'abtimg', side);
            win.main.style.padding = "0px";
            tk.cb('b4 b2', 'Changes', () => wd.hawktuah(true), side);
            tk.cb('b4 b2', 'Status', async function () {
                const win = tk.mbw('Status', '300px', undefined, true);
                try {
                    const response = await fetch(`https://weather.meower.xyz/status`);
                    const info = await response.json();
                    if (info.status) {
                        tk.ps('Weather: ' + info.status, undefined, win.main);
                    } else {
                        tk.ps('Weather: Offline', undefined, win.main);
                    }
                } catch (error) {
                    tk.ps('Weather: Offline', undefined, win.main);
                }
                try {
                    const response = await fetch(`https://appmarket.meower.xyz/status`);
                    const info = await response.json();
                    if (info.status) {
                        tk.ps('App Market: ' + info.status, undefined, win.main);
                    } else {
                        tk.ps('App Market: Offline', undefined, win.main);
                    }
                } catch (error) {
                    tk.ps('App Market: Offline', undefined, win.main);
                }
            }, side);
            tk.cb('b4 b2', 'Discord', () => window.open('https://discord.gg/5Y6ycJS4gu', '_blank'), side);
            tk.cb('b4 b2', 'Creds', function () {
                const ok = tk.c('div', document.body, 'cm');
                ok.innerHTML = `<p class="bold">Credits</p>
                <p>All the libraries or materials that helped create WebDesk.</p>
                <p><a href="https://peerjs.com/" target="blank">PeerJS: DeskID/online services</a></p>
                <p><a href="https://davidshimjs.github.io/qrcodejs/" target="blank">qrcode.js: WebDesk QR codes</a></p>
                <p><a href="https://jquery.com/" target="blank">jQuery: WebDesk's UI</a></p>
                <p><a href="https://ace.c9.io/" target="blank">Ace: TextEdit's engine</a></p>
                <p><a href="https://fengyuanchen.github.io/cropperjs/" target="blank">cropper.js: Cropping tool</a></p>
                <p><a href="https://jscolor.com/" target="blank">jscolor: Color picker</a></p>
                <p><a href="https://ace.c9.io/" target="blank">jszip: ZIP file handling</a></p>`;
                tk.cb('b1', 'Close', function () {
                    ui.dest(ok, 200);
                }, ok);
            }, side);
            const setupon = await fs.read('/system/info/setuptime');
            const ogver = await fs.read('/system/info/setupver');
            const color = await fs.read('/user/info/color');
            tk.p(`WebDesk ${abt.ver}`, 'h2', info);
            tk.p(`<span class="bold">Updated</span> ${abt.lastmod}`, undefined, info);
            if (setupon) {
                const fucker = wd.timed(Number(setupon));
                const seo = tk.p(`<span class="bold">Set up on</span> `, undefined, info);
                const seos = tk.c('span', seo);
                seos.innerText = fucker;
            }
            tk.p(`<span class="bold">DeskID</span> ${sys.deskid}`, undefined, info);
            if (ogver) {
                const ogv = tk.p(`<span class="bold">Set up with </span> `, undefined, info);
                const ogvs = tk.c('span', ogv);
                ogvs.innerText = ogver;
            }
            if (sys.dev) {
                tk.p(`<span class="bold">Dev Mode</span> ` + sys.dev, undefined, info);
            }
            if (color) {
                const col = tk.p(`<span class="bold">Color</span> `, undefined, info);
                const cols = tk.c('span', col);
                cols.innerText = color;
            }
            win.win.style.resize = "none";
        }
    },
    backup: {
        runs: true,
        name: 'Data Assistant',
        init: async function () {
            const win = tk.mbw('Data Assistant', '300px', 'auto', true, undefined, undefined);
            if (sys.guest === false) {
                tk.p(`Your apps will close, and unsaved data will be lost.`, undefined, win.main);
                tk.cb('b1', 'Migrate', async function () {
                    await fs.write('/system/migval', 'down');
                    wd.reboot();
                }, win.main);
            } else {
                tk.p(`You're in Guest mode. Reboot WebDesk and go through Setup to copy your data over.`, undefined, win.main);
                tk.cb('b1', 'Reboot', async function () {
                    wd.reboot();
                }, win.main);
            }
        }
    },
    lockscreen: {
        runs: false,
        name: 'Lockscreen',
        init: async function () {
            if (!el.lock) {
                wd.clock();
                el.lock = tk.c('div', document.body, 'lockscreen');
                const clock = tk.c('div', el.lock, 'center');
                ui.show(el.lock, 300);
                const img = tk.img(`https://openweathermap.org/img/wn/10d@2x.png`, 'locki', clock);
                const p = tk.p('--:--', 'time h2', clock);
                clock.style.maxWidth = "200px";
                let ok = false;
                if (sys.setupd === "eepy") {
                    const selfdest = tk.p('Click anywhere to keep DeskID active and recieve notifications', undefined, clock);
                    function yeah(e) {
                        document.body.removeEventListener('mousedown', yeah);
                        e.preventDefault();
                        ui.dest(selfdest);
                        ok = true;
                    }

                    document.body.addEventListener('mousedown', yeah);
                } else {
                    ok = true;
                }
                const weather = tk.p('Loading', 'smtxt med', clock);
                p.style.color = weather.style.color = "#fff";
                const updateweather = async () => {
                    try {
                        const response = await fetch(`https://weather.meower.xyz/json?city=${sys.city}&units=${sys.unit}`);
                        const info = await response.json();
                        weather.innerText = `${Math.ceil(info.main.temp)}${sys.unitsym}, ${info.weather[0].description}`;
                        img.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`;
                    } catch (error) {
                        weather.innerText = "Error";
                    }
                };
                const interval = setInterval(updateweather, 300000);
                let menuo = false;
                if (sys.setupd === "eepy") {
                    el.lock.addEventListener('mousedown', async () => {
                        if (menuo === false && ok === true) {
                            const menu = tk.c('div', el.lock, 'cm');
                            el.lock.style.cursor = "default";
                            menu.style.width = "130px";
                            menuo = true;
                            tk.p('Exit Deep Sleep', 'bold', menu);
                            tk.cb('b1', 'Yes', async function () {
                                await fs.del('/system/eepysleepy');
                                sys.resume();
                                clearInterval(interval);
                                el.lock.remove();
                                el.lock = undefined;
                                ui.show(tk.g('contain'), 0);
                            }, menu);
                            tk.cb('b1', 'No', async function () {
                                ui.dest(menu);
                                el.lock.style.cursor = "none";
                                menuo = false;
                            }, menu);
                        }
                    });
                } else {
                    el.lock.addEventListener('mousedown', async () => {
                        const { innerHeight: windowHeight } = window;
                        el.lock.style.transition = 'transform 0.3s ease';
                        el.lock.style.transform = `translateY(-${windowHeight}px)`;
                        await new Promise(resolve => {
                            el.lock.addEventListener('transitionend', function onTransitionEnd() {
                                el.lock.removeEventListener('transitionend', onTransitionEnd);
                                clearInterval(interval);
                                el.lock.remove();
                                el.lock = undefined;
                                resolve();
                            });
                        });
                    });
                }
                await updateweather();
            }
        }
    },
    wetter: {
        runs: true,
        name: 'Weather',
        init: async function (archive, file) {
            const win = tk.mbw('Weather', 'auto', 'auto', true, undefined, undefined);
            win.win.style.minWidth = "210px;"
            /* const canvas = tk.c('canvas', document.body);
            canvases.snow(canvas);
            canvas.style.width = "100%";
            canvas.style.display = "block";
            win.closebtn.addEventListener('mousedown', function () {
                ui.dest(canvas);
            }); */
            if (sys.mobui === false) {
                win.win.style.maxWidth = "330px";
            }
            win.main.innerHTML = "Loading";
            async function refresh() {
                let response;
                let info;
                if (archive !== true) {
                    response = await fetch(`https://weather.meower.xyz/json?city=${sys.city}&units=${sys.unit}`);
                    info = await response.json();
                } else {
                    info = await JSON.parse(file);
                }
                win.main.innerHTML = "";
                const skibidi = tk.c('div', win.main);
                if (archive !== true) {
                    tk.p(`${sys.city}`, 'med', skibidi);
                    win.name.innerHTML = "";
                    tk.cb('b3', 'Archive data', async function () {
                        const the = await app.files.pick('new', 'Save weather archive file... (JSON)');
                        const silly = info;
                        silly.timestamp = Date.now();
                        await fs.write(the + ".json", silly);
                        wm.snack('Saved weather to ' + the + ".json");
                    }, win.name);
                } else {
                    tk.p(`${sys.city}`, 'med', skibidi);
                    tk.ps('Archived: ' + wd.timec(info.timestamp), undefined, skibidi);
                }
                const userl = tk.c('div', skibidi, 'list flexthing');
                const tnav = tk.c('div', userl, 'tnav');
                const title = tk.c('div', userl, 'title');
                tnav.style.marginLeft = "6px";
                userl.style.marginBottom = "6px";
                tnav.innerText = `${Math.ceil(info.main.temp)}${sys.unitsym}, ${info.weather[0].description}`;
                const img = tk.img('', 'weatheri', title);
                title.style.maxHeight = "40px";
                img.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`;
                tk.p(`Humidity ${archive = archive === true ? "was" : "is"} ${info.main.humidity}%, and it ${archive = archive === true ? "felt" : "feels"} like ${Math.ceil(info.main.feels_like)}${sys.unitsym}.`, undefined, skibidi);
                tk.p(`Data from <a href="https://openweathermap.org", target="_blank">OpenWeatherMap.</a>`, 'smtxt', skibidi);
                tk.cb('b1', 'Settings', () => app.locset.init(), skibidi);
                tk.cb('b1', 'Refresh', function () {
                    refresh(); wm.snack('Refreshed');
                }, skibidi);
                if (sys.dev === true) {
                    tk.cb('b1', 'JSON', async function () {
                        const ok = JSON.stringify(info);
                        app.textedit.init(ok, undefined, true);
                    }, skibidi);
                }
            }

            await refresh();
        }
    },
    echoclient: {
        runs: true,
        name: 'EchoDesk',
        init: async function () {
            const win = tk.mbw('EchoDesk', '300px', 'auto', true, undefined, undefined);
            if (sys.guest === true) {
                tk.p(`Enter the EchoDesk ID and hit either of the "Connect" buttons. <span class="bold">You're in Guest mode, so you can't enter EchoDesk mode.</span>`, undefined, win.main);
            } else {
                tk.p(`If you're connecting: Enter the EchoDesk ID and hit either of the "Connect" buttons.`, undefined, win.main);
                tk.p(`If you're the host: Hit "Enter EchoDesk Mode". Your apps will close, unsaved data will be lost.`, undefined, win.main);
                tk.cb('b1 b2', 'Enter EchoDesk mode', async function () {
                    await fs.write('/system/migval', 'echo');
                    wd.reboot();
                }, win.main);
            }
            tk.p(`Connect to other WebDesk`, undefined, win.main);
            const input = tk.c('input', win.main, 'i1');
            input.placeholder = "Enter EchoDesk ID";
            tk.cb('b1 b2', 'Connect in New Tab', async function () {
                window.open("./echodesk.html?deskid=" + input.value, '_blank');
            }, win.main);
            tk.cb('b1 b2', 'Connect Normally', async function () {
                app.browser.view("./echodesk.html?deskid=" + input.value);
            }, win.main);
        }
    },
    // who made that mess
    // YOU DID KING!
    // 🐦
    // i made the mess!
    appmark: {
        runs: true,
        name: 'App Market',
        create: async function (apploc, app, update) {
            async function execute(url2) {
                try {
                    const response = await fetch(url2);
                    if (!response.ok) {
                        wm.wal(`<p>Couldn't load apps, check your internet or try again later. If it's not back up within an hour, DM macos.amfi on Discord.</p>`);
                    }
                    const scriptContent = await response.text();
                    const script = document.createElement('script');
                    script.textContent = scriptContent;
                    document.head.appendChild(script);
                    sys.installer = script;
                    return scriptContent;
                } catch (error) {
                    console.error(`Failed to execute script: ${error}`);
                    throw error;
                }
            }

            console.log(`<i> Installing ${apploc}`);
            const apps = await fs.read('/system/apps.json');
            const newen = { name: app.name, ver: app.ver, installedon: Date.now(), dev: app.pub, appid: app.appid, exec: '/system/apps/' + app.appid + '.js' };
            const jsondata = JSON.parse(apps);
            const check = jsondata.some(entry => entry.appid === newen.appid);
            if (check === true) {
                wm.snack('Already installed');
                return;
            } else {
                jsondata.push(newen);
                if (update === true) {
                    wm.notif(app.name + ' was updated');
                } else {
                    wm.notif(app.name + ' was installed');
                }
                fs.write('/system/apps.json', jsondata);
            }
            const ok = await execute(sys.appurl + apploc);
            await fs.write('/system/apps/' + app.appid + '.js', ok);
        },
        init: async function () {
            const win = tk.mbw('App Market', '340px', 'auto', true, undefined, undefined);
            const apps = tk.c('div', win.main);
            const appinfo = tk.c('div', win.main, 'hide');
            async function loadapps() {
                try {
                    const response = await fetch(sys.appurl);
                    const apps = await response.json();
                    apps.forEach(function (app2) {
                        const notif = tk.c('div', win.main, 'notif2');
                        tk.p(`<span class="bold">${app2.name}</bold> by ${app2.pub}`, 'bold', notif);
                        tk.p(app2.info, undefined, notif);
                        tk.cb('b3', 'App ID', () => wm.notif(`${app2.name}'s App ID:`, app2.appid, () => ui.copy(app2.appid), 'Copy', true), notif); tk.cb('b3', 'Install', () => app.appmark.create(app2.path, app2), notif)
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            tk.p(`Look for things you might want, all apps have <span class="bold">full access</span> to this WebDesk/it's files. Anything in this store is safe.`, undefined, apps);
            if (sys.dev === true) {
                tk.cb('b1', 'Sideload', function () {
                    const menu = tk.c('div', document.body, 'cm');
                    let path2 = undefined;
                    tk.p('Sideload', 'bold', menu);
                    tk.p('Only sideload things you made.', undefined, menu);
                    const name = tk.c('input', menu, 'i1');
                    name.placeholder = "App name";
                    const dev = tk.c('input', menu, 'i1');
                    dev.placeholder = "App developer";
                    const pathbtn = tk.cb('b1 b2 dash', `Choose JS file`, async function () {
                        const path = await app.files.pick();
                        pathbtn.innerText = path;
                        path2 = path;
                    }, menu);
                    tk.cb('b1', `Cancel`, function () {
                        ui.dest(menu);
                    }, menu);
                    tk.cb('b1', `Install`, async function () {
                        if (name.value !== "" && dev.value !== "" && path2 !== undefined) {
                            const newen = { name: name.value, ver: 1.0, installedon: Date.now(), dev: dev.value, appid: gen(12), exec: path2 };
                            const apps = await fs.read('/system/apps.json');
                            const jsondata = JSON.parse(apps);
                            jsondata.push(newen);
                            fs.write('/system/apps.json', jsondata);
                            ui.dest(menu);
                            wm.snack('Installed ' + name.value);
                        } else {
                            wm.snack('Fill out all inputs');
                        }
                    }, menu);
                }, apps);
                tk.cb('b1', 'Settings', async function () {
                    const menu = tk.c('div', document.body, 'cm');
                    let path2 = undefined;
                    tk.p('Settings', 'bold', menu);
                    tk.p('Only type URLs you trust.', undefined, menu);
                    const check = await fs.read('/system/appurl');
                    const name = tk.c('input', menu, 'i1');
                    name.placeholder = "Custom App Store repo";
                    if (check) {
                        name.value = check;
                    }
                    tk.cb('b1', `Cancel`, function () {
                        ui.dest(menu);
                    }, menu);
                    tk.cb('b1', `Reset`, function () {
                        sys.appurl = `https://appmarket.meower.xyz/refresh`;
                        fs.del('/system/appurl');
                        ui.dest(menu);
                        wm.snack('Reset repo to defaults');
                    }, menu);
                    tk.cb('b1', `Save`, async function () {
                        if (name.value !== "") {
                            fs.write('/system/appurl', name.value);
                            sys.appurl = name.value;
                            wm.snack('Saved');
                        } else {
                            wm.snack('Fill out inputs');
                        }
                        ui.dest(menu);
                    }, menu);
                }, apps);
            }
            await loadapps();
        },
    },
    ach: {
        runs: true,
        name: 'Achievements',
        init: async function () {
            async function load() {
                try {
                    const data = await fs.read('/user/info/achieve.json');
                    if (data) {
                        const parsed = JSON.parse(data);
                        let yeah = 0;
                        parsed.forEach((entry) => {
                            const notif = tk.c('div', win.main, 'notif2');
                            tk.p(entry.name, 'bold', notif);
                            tk.p(entry.cont, undefined, notif);
                            tk.p(`Unlocked on ${wd.timec(entry.time)}`, undefined, notif);
                            yeah++
                        });
                        const elements = document.getElementsByClassName("achcount");
                        for (let i = 0; i < elements.length; i++) {
                            elements[i].innerText = yeah;
                        }
                    } else {
                        await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                        await load();
                    }
                } catch (error) {
                    console.log('<!> Achievements shat itself: ', error);
                    return null;
                }
            }

            const win = tk.mbw('Achievements', '300px', 'auto', true, undefined, undefined);
            if (sys.mobui === false) {
                win.win.style.maxHeight = "60%";
            }
            tk.p(`WebDesk Achievements`, 'h2', win.main);
            tk.p(`Remember: These are jokes and don't actually do anything`, undefined, win.main);
            tk.p(`Unlocked <span class="bold achcount"></span> achievements`, undefined, win.main);
            await load();
        },
        unlock: async function (name, content) {
            try {
                const data = await fs.read('/user/info/achieve.json');
                if (data) {
                    const newen = { name: name, cont: content, time: Date.now() };
                    const jsondata = JSON.parse(data);
                    const check = jsondata.some(entry => entry.name === newen.name);
                    const check2 = jsondata.some(entry => entry.cont === newen.cont);
                    if (check !== true && check2 !== true) {
                        wm.notif(`Achieved: ` + name, content, () => app.ach.init());
                        jsondata.push(newen);
                        fs.write('/user/info/achieve.json', jsondata);
                    }
                } else {
                    await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                    await app.ach.unlock(name, content);
                }
            } catch (error) {
                console.log('<!> Achievements shat itself: ', error);
                return null;
            }
        }
    },
    contacts: {
        runs: false,
        name: 'Contacts',
        init: async function () {
            let ok;
            function reload() {
                ui.dest(win.win, 20);
                ui.dest(win.tbn, 0);
                app.contacts.init();
            }
            async function load() {
                try {
                    const data = await fs.read('/user/info/contactlist.json');
                    if (data) {
                        ok = JSON.parse(data);
                        let yeah = 0;
                        ok.forEach((entry) => {
                            const notif = tk.c('div', win.main, 'notif2');
                            tk.ps(entry.name, 'bold', notif);
                            if (entry.deskid2) {
                                tk.ps(`DeskID: ${entry.deskid} | DeskID 2: ${entry.deskid2}`, undefined, notif);
                            } else {
                                tk.ps(`DeskID: ${entry.deskid} | DeskID 2: Not set`, undefined, notif);
                            }
                            tk.cb('b4', 'Remove', async function () {
                                const update = ok.filter(item => item.time !== entry.time);
                                const updated = JSON.stringify(update);
                                await fs.write('/user/info/contactlist.json', updated);
                                reload();
                            }, notif);
                            tk.cb('b4', 'Edit', async function () {
                                const update = ok.find(item => item.time === entry.time);
                                const menu = tk.c('div', document.body, 'cm');
                                tk.p(`Edit Contact`, 'bold', menu);
                                const name = tk.c('input', menu, 'i1');
                                name.placeholder = "User's username";
                                if (update && update.name) name.value = update.name;
                                const deskid = tk.c('input', menu, 'i1');
                                deskid.placeholder = "User's default/main DeskID";
                                if (update && update.deskid) deskid.value = update.deskid;
                                const deskid2 = tk.c('input', menu, 'i1');
                                deskid2.placeholder = "Second ID if first is offline";
                                if (update && update.deskid2) deskid2.value = update.deskid2;
                                tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                tk.cb('b1', 'Save', async function () {
                                    const updatedData = ok.filter(item => item.time !== entry.time);
                                    const newEntry = {
                                        deskid: deskid.value,
                                        name: name.value,
                                        time: Date.now()
                                    };
                                    if (deskid2.value) newEntry.deskid2 = deskid2.value;
                                    updatedData.push(newEntry);
                                    await fs.write('/user/info/contactlist.json', updatedData);
                                    ui.dest(menu);
                                    reload();
                                }, menu);
                            }, notif);
                        });
                    } else {
                        await fs.write('/user/info/contactlist.json', '[]');
                        await load();
                    }
                } catch (error) {
                    console.log('<!> Contacts shat itself: ', error);
                    return null;
                }
            }

            const win = tk.mbw('Contacts', '300px', 'auto', true, undefined, undefined);
            tk.cb('b1 b2', 'Add Contact', function () {
                const menu = tk.c('div', document.body, 'cm');
                const name = tk.c('input', menu, 'i1');
                name.placeholder = "User's name";
                const deskid = tk.c('input', menu, 'i1');
                deskid.placeholder = "User's default DeskID";
                const deskid2 = tk.c('input', menu, 'i1');
                deskid2.placeholder = "User's second DeskID";
                tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                tk.cb('b1', 'Save', async function () {
                    const newEntry = {
                        deskid: deskid.value,
                        name: name.value,
                        time: Date.now()
                    };
                    const update = ok.find(item => item.deskid === newEntry.deskid);
                    console.log(update);
                    if (update !== undefined) {
                        wm.snack('Already saved that person');
                    } else {
                        if (deskid2.value) newEntry.deskid2 = deskid2.value;
                        ok.push(newEntry);
                        await fs.write('/user/info/contactlist.json', ok);
                        ui.dest(menu);
                        reload();
                    }
                }, menu);
            }, win.main);
            await load();
        },
    },
    browser: {
        runs: true,
        name: 'Browser (beta)',
        init: async function (path2) {
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw('Browser', '70vw', '74vh');
            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const okiedokie = tk.c('div', tabs, 'browsertitle');
            const searchbtns = tk.c('div', okiedokie, 'tnav');
            btnnest.appendChild(win.winbtns);
            win.closebtn.style.marginLeft = "4px";
            win.winbtns.style.marginBottom = "3px";
            win.title.remove();
            let thing = [];
            let currentTab = tk.c('div', win.main, 'hide');
            let currentBtn = tk.c('div', win.main, 'hide');
            let currentName = tk.c('div', win.main, 'hide');
            win.main.classList = "browsercont";
            const searchInput = tk.c('input', okiedokie, 'i1 b6');
            function addtab(ok) {
                const tab = tk.c('embed', win.main, 'browsertab');
                if (ok) {
                    tab.src = ok;
                } else {
                    tab.src = "https://meower.xyz";
                }
                ui.sw2(currentTab, tab, 100);
                currentTab = tab;
                let lastUrl = "";
                const urls = [];
                thing = [...urls];

                const tabBtn = tk.cb('b4 browserpad', '', function () {
                    ui.sw2(currentTab, tab, 100);
                    currentTab = tab;
                    currentBtn = tabTitle;
                    thing = [...urls];
                }, win.winbtns);
                const tabTitle = tk.c('span', tabBtn);
                if (ok) {
                    tabTitle.innerText = ok;
                } else {
                    tabTitle.innerText = "meower.xyz";
                }
                currentName = tabTitle;
                currentBtn = tabTitle;

                const closeTabBtn = tk.cb('browserclosetab', 'x', function () {
                    ui.dest(tabBtn);
                    ui.dest(currentTab);
                }, tabBtn);
                setInterval(function () {
                    const currentUrl = currentTab.src;
                    if (currentUrl !== lastUrl) {
                        lastUrl = currentUrl;
                        urls.push(currentUrl);
                        thing = [...urls];
                        searchInput.innerText = currentUrl;
                        currentName.innerText = currentUrl;
                    }
                }, 200);
            }

            tk.cb('b4 b6', '+', () => addtab(), searchbtns);
            tk.cb('b4 b6', '⟳', function () {
                currentTab.src = currentTab.src;
            }, searchbtns);
            tk.cb('b4 b6', '<', function () {
                if (thing.length > 1) {
                    const currentIndex = thing.indexOf(currentTab.src);
                    if (currentIndex > 0) {
                        const li = thing[currentIndex - 1];
                        searchInput.value = li;
                        currentTab.src = li;
                        currentName.innerText = li;
                    }
                }
            }, searchbtns);
            tk.cb('b4 b6', '>', function () {
                if (thing.length > 1) {
                    const currentIndex = thing.indexOf(currentTab.src);
                    if (currentIndex < thing.length - 1) {
                        const li = thing[currentIndex + 1];
                        searchInput.value = li;
                        currentTab.src = li;
                        currentName.innerText = li;
                    }
                }
            }, searchbtns);
            searchInput.placeholder = "Enter URL";
            tk.cb('b4 b6', 'Go!', function () {
                if (searchInput.value.includes('https://')) {
                    currentTab.src = searchInput.value;
                } else {
                    currentTab.src = "https://" + searchInput.value;
                }
                currentBtn.innerText = searchInput.value;
                if (searchInput.value.includes('porn') || searchInput.value.includes('e621') || searchInput.value.includes('rule34') || searchInput.value.includes('r34') || searchInput.value.includes('xvideos') || searchInput.value.includes('c.ai') || searchInput.value.includes('webtoon')) {
                    app.ach.unlock('The Gooner', `We won't judge — we promise.`);
                } else if (searchInput.value.includes(window.origin)) {
                    app.ach.unlock('Webception!', `Just know that the other WebDesk will probably end up erased.`);
                }
            }, okiedokie);

            setTimeout(function () {
                if (typeof path2 === "string") {
                    addtab(path2);
                } else {
                    addtab();
                }
            }, 250);
            wd.win();
        },
        view: async function (path2) {
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw(`Embedder`, '640px', '440px', true);
            ui.dest(win.title, 0);
            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const tab = tk.c('embed', win.main, 'browsertab');
            win.main.classList = "browsercont";
            const fucker = tk.cb('winb red', '', function () {
                ui.dest(win.win, 150);
                ui.dest(win.tbn, 150);
            }, btnnest);
            fucker.style.marginLeft = "6px";
            tk.cb('winb yel', '', function () {
                ui.hide(win.win, 150);
            }, btnnest);
            tk.cb('winb gre', '', function () {
                wm.max(win.win);
            }, btnnest);
            tk.cb('b4 b6', '⟳', function () {
                tab.src = tab.src;
            }, btnnest);
            setTimeout(function () {
                if (path2) {
                    tab.src = path2;
                } else {
                    tab.src = "https://meower.xyz";
                }
                ui.show(tab, 0);
            }, 250);
            wd.win();
        }
    },
    webcall: {
        runs: false,
        init: async function (deskid, name) {
            const win = tk.mbw('WebCall', '260px', 'auto', true, undefined, undefined);
            const callStatus = tk.p(`Connecting...`, undefined, win.main);
            let oncall = false;
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                remotePeerId = deskid;
                const call = sys.peer.call(remotePeerId, stream);
                callStatus.textContent = 'Waiting for answer...';
                app.webcomm.add(call.peer, name);
                setTimeout(() => {
                    if (!oncall) {
                        callStatus.textContent = `Other person didn't answer`;
                        call.close();
                    }
                }, 24000);

                call.on('stream', (remoteStream) => {
                    oncall = true;
                    ui.dest(win.tbn, 100);
                    ui.dest(win.win, 100);
                    app.webcall.answer(remoteStream, call, name, stream);
                });

                call.on('error', (err) => {
                    callStatus.textContent = 'Call failed: ' + err.message;
                });
            });
            const selfkill = win.closebtn.addEventListener('mousedown', function () {
                call.close();
                stream.getTracks().forEach(track => track.stop());
                selfkill.removeEventListener();
            });
        },
        answer: async function (remoteStream, call, name, fein) {
            const win = tk.mbw('WebCall', '250px', 'auto', true, undefined, undefined);
            const stat = tk.ps(`WebCall - ${name}`, undefined, win.main);
            const audioElement = tk.c('audio', win.main, 'hide');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.controls = true;

            let isMuted = false;
            const remoteAudioTrack = fein.getAudioTracks()[0];

            const muteButton = tk.cb('b1', 'Mute', function () {
                if (remoteAudioTrack) {
                    if (isMuted) {
                        remoteAudioTrack.enabled = true;
                        muteButton.textContent = 'Mute';
                    } else {
                        remoteAudioTrack.enabled = false;
                        muteButton.textContent = 'Unmute';
                    }
                    isMuted = !isMuted;
                }
            }, win.main);

            function crashout() {
                call.close();
                fein.getTracks().forEach(track => track.stop());
                remoteStream.getTracks().forEach(track => track.stop());
                ui.dest(win.tbn, 100);
                ui.dest(win.win, 100);
            }

            audioElement.onended = () => {
                stat.textContent = 'Call ended.';
                crashout();
            };

            remoteStream.oninactive = () => {
                stat.textContent = 'Call ended.';
                crashout();
            };

            tk.cb('b1', 'End', () => crashout(), win.main);

            const selfkill = win.closebtn.addEventListener('mousedown', function () {
                crashout();
                selfkill.removeEventListener();
            });
        }
    },
};