var app = {
    settings: {
        runs: true,
        name: 'Settings',
        init: async function () {
            const main = tk.mbw('Settings', '300px', 'auto', true, undefined, undefined);
            const generalPane = tk.c('div', main.main, 'hide');
            const appearPane = tk.c('div', main.main, 'hide');
            const mainPane = tk.c('div', main.main);
            // Main pane
            tk.p('Settings', undefined, mainPane);
            tk.cb('b1 b2', 'General', () => ui.sw2(mainPane, generalPane), mainPane);
            tk.cb('b1 b2', 'Appearance', () => ui.sw2(mainPane, appearPane), mainPane);
            // General pane
            tk.p('General', undefined, generalPane);
            tk.cb('b1 b2 red', 'Erase This WebDesk', () => app.eraseassist.init(), generalPane);
            tk.cb('b1 b2 red', 'Remove All App Market Apps', () => wm.wal(`<p>Warning: Removing all App Market apps will cause a reboot and delete them, but their data will remain.</p>`, function () {
                fs.del('/system/apps.json');
                setTimeout(function () { window.location.reload() }, 250);
            }, 'Okay'), generalPane);
            tk.cb('b1', 'Back', () => ui.sw2(generalPane, mainPane), generalPane);
            // Appearance pane
            tk.p('Appearance', undefined, appearPane);
            const bg1 = tk.c('input', appearPane, 'i1');
            bg1.setAttribute("data-jscolor", "{}");
            bg1.addEventListener('input', function () {
                ui.crtheme(event.target.value);
            });
            new JSColor(bg1, undefined);
            tk.p('UI Theme', undefined, appearPane);
            tk.cb('b1 b2', 'Light mode', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.light();
            }, appearPane);
            tk.cb('b1 b2', 'Dark mode', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.dark();
            }, appearPane);
            tk.cb('b1 b2', 'Auto (based off color picker)', async function () {
                fs.write('/user/info/lightdarkpref', 'auto');
                const killyourselfapplesheep = await fs.read('/user/info/color');
                ui.crtheme(killyourselfapplesheep);
                sys.autodarkacc = true;
            }, appearPane);
            tk.cb('b1 b2', 'Clear mode (Light Text)', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.clearm2();
            }, appearPane);
            tk.cb('b1 b2', 'Clear mode (Dark Text)', function () {
                fs.del('/user/info/lightdarkpref');
                sys.autodarkacc = false;
                wd.clearm();
            }, appearPane);
            tk.p('Other', undefined, appearPane);
            tk.cb('b1', 'Reset Colors', function () {
                fs.del('/user/info/color');
                fs.del('/user/info/lightdark');
                fs.del('/user/info/lightdarkpref');
                wm.wal('Reboot to finish resetting colors.', () => wd.reboot(), 'Reboot');
            }, appearPane); tk.cb('b1', 'Back', () => ui.sw2(appearPane, mainPane), appearPane);
        }
    },
    eraseassist: {
        runs: false,
        init: function () {
            ui.play('./assets/other/error.ogg');
            wm.wal(`<p>Warning: Erasing this WebDesk will destroy all data stored on it, this cannot be undone!</p>`, () => fs.erase('reboot'), 'Erase');
        }
    },
    echodesk: {
        runs: false,
        init: function () {
            const main = tk.c('div', document.getElementById('setuparea'), 'setupbox');
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
            tk.p(`Use the ID below to start your WebDesk on another WebDesk. Be aware, the other person will have full access to your files.`, undefined, first);
            sys.model = tk.p(`Most recent file action will show here`, 'greyp', first);
            tk.p('--------', 'h2 deskid', first);
            tk.cb('b1', `Exit EchoDesk`, () => wd.reboot(), first);
            sys.setupd = "echo";
        }
    },
    setup: {
        runs: false,
        init: function () {
            const main = tk.c('div', document.getElementById('setuparea'), 'setupbox');
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
            tk.cb('b1', `Guest`, () => wd.desktop('Guest', gen(8)), first);
            tk.cb('b1', `Let's go`, () => ui.sw2(first, transfer), first);
            // migrate menu
            const transfer = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/quick.png', 'setupi', transfer);
            tk.p('Quick Start', 'h2', transfer);
            tk.p('To copy your data, open Data Assistant on the other WebDesk, hit "Migrate", and enter this code:', undefined, transfer);
            tk.p('--------', 'h2 deskid', transfer);
            tk.cb('b1', 'No thanks', () => ui.sw2(transfer, warn), transfer);
            transfer.id = "quickstartwdsetup";
            // copying menu
            const copy = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/restore.svg', 'setupi', copy);
            tk.p('Restoring from other WebDesk', 'h2', copy);
            tk.p('This might take a while depending on settings and file size.', undefined, copy);
            el.migstat = tk.p('Starting...', 'restpg', copy);
            tk.cb('b1', 'Cancel', function () { fs.erase('reboot'); }, copy);
            copy.id = "quickstartwdgoing";
            // warn menu
            const warn = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/noround.png', 'setupi', warn);
            tk.p(`WebDesk Online services`, 'h2', warn);
            tk.p('WebDesk makes an ID called a DeskID for you. Others can use this ID to send you files or call you.', undefined, warn);
            tk.p('To recieve calls and files from others, WebDesk needs to be open. When not in use, WebDesk uses less resources.', undefined, warn);
            tk.cb('b1', `What's my DeskID?`, function () {
                const box = wm.cm();
                tk.p(`Your DeskID is <span class="med">${sys.deskid}</span>. You'll need to finish setup to use it.`, undefined, box);
                tk.cb('b1', 'Got it', undefined, box);
            }, warn); tk.cb('b1', 'Got it', function () { ui.sw2(warn, user) }, warn);
            // user menu
            const user = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/user.svg', 'setupi', user);
            tk.p('Create a User', 'h2', user);
            tk.p(`Data is stored on your device only. You can optionally give your city's name for unit detection, weather info, etc.`, undefined, user);
            const input = tk.c('input', user, 'i1');
            input.placeholder = "Enter a name to use with WebDesk";
            const loc = tk.c('input', user, 'i1');
            loc.placeholder = "The city you're in (not required)";
            tk.cb('b1', 'Done!', function () {
                wd.finishsetup(input.value, user, sum); if (loc.value !== "") {
                    fs.write('/user/info/city', loc.value);
                }
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
            const main = tk.c('div', document.getElementById('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            var backup = undefined;
            tk.cb('b4', 'Force Exit', () => wm.wal(`<p>If WebDesk is stuck, use this to leave.</p><p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`, () => reboot(), 'Force Exit'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // migrate menu
            const transfer = tk.c('div', main, 'setb');
            tk.img('./assets/img/setup/quick.png', 'setupi', transfer);
            tk.p('Migration Assistant', 'h2', transfer);
            const stats = tk.p(`Only enter your own code. If you use someone else's, you might be giving your data to a scammer.`, 'bold', transfer);
            const inp = tk.c('input', transfer, 'i1');
            inp.placeholder = "Enter the code shown on the other WebDesk";
            tk.cb('b1', `Cancel Migration`, function () {
                ui.show(document.getElementById('death'), 400);
                setTimeout(wd.reboot, 390);
            }, transfer);
            tk.cb('b1', 'Done, copy data!', async function () {
                stats.innerText = `Connecting to other WebDesk...`;
                migrationgo(inp.value, stats).then((result) => {
                    if (result === true) {
                        ui.sw2(transfer, sum);
                    } else {
                        wm.wal(`<p>Data Assistant couldn't communicate with the other WebDesk</p>`, () => wd.reboot(), 'Reboot Now');
                        console.log(`<!> Data Assistant Error: ${result}`);
                    }
                }).catch((error) => {
                    wm.wal(`<p>Data Assistant encountered an error</p>`, () => reboot(), 'Reboot Now');
                    console.log('<!> ' + error);
                });

                setTimeout(function () {
                    if (stats.innerText === `Connecting to other WebDesk...`); {
                        wm.wal(`<p>Couldn't connect to other WebDesk, try these things to fix it:</p><li>Check your Internet connection</li><li>Disable your VPN temporarily, then reload both WebDesks</li><li>Reload the other WebDesk first, then this one second</li>`);
                    }
                }, 9000);
            }, transfer);
            transfer.id = "quickstartwdsetup";
            // summary
            const sum = tk.c('div', main, 'setb hide');
            tk.img('./assets/img/setup/check.svg', 'setupi', sum);
            tk.p('All done!', 'h2', sum);
            tk.p(`Data has been moved to the other WebDesk. Hit "Finish" to go back to WebDesk, or you can erase this one if you're not going to use it.`, undefined, sum);
            tk.cb('b1', 'Erase This WebDesk', function () { app.eraseassist.init(); }, sum); tk.cb('b1', 'Finish', function () { wd.reboot(); }, sum);
            sum.id = "setupdone";
        }
    },
    imgview: {
        runs: false,
        name: 'Iris',
        init: async function (contents) {
            const win = tk.mbw('Iris Media Viewer', '550px', 'auto', true, undefined, undefined);
            if (contents.includes('data:image')) {
                const img = tk.c('img', win.main, 'embed');
                img.src = contents;
            } else if (contents.includes('data:video')) {
                const img = tk.c('video', win.main, 'embed');
                const src = tk.c('source', img);
                src.src = contents;
                img.controls = true;
            } else if (contents.includes('data:audio')) {
                const img = tk.c('audio', win.main);
                const src = tk.c('source', img);
                src.src = contents;
                img.controls = true;
            }
        }
    },
    textedit: {
        runs: false,
        name: 'TextEdit',
        init: async function (contents, path) {
            const win = tk.mbw('TextEdit', '300px', 'auto', true, undefined, undefined);
            const ok = tk.c('textarea', win.main, 't1');
            ok.rows = "10";
            ok.placeholder = "Start typing something...";
            if (contents) {
                ok.innerText = contents;
            }
            const save = tk.cb('b4 b2', 'Save', async function () {
                await fs.write(path, ok.value);
                wm.snack('Saved');
            }, win.main);
            win.win.style.resize = "horizontal";
        }
    },
    files: {
        runs: true,
        name: 'Files',
        init: async function (oppath) {
            const win = tk.mbw(`Files`, '340px', 'auto', true, undefined, undefined);
            const breadcrumbs = tk.c('div', win.main);
            const items = tk.c('div', win.main);
            var fuck = undefined;
            async function navto(path) {
                items.innerHTML = "";
                breadcrumbs.innerHTML = "";
                let crumbs = path.split('/').filter(Boolean);
                let currentp = '/';
                tk.cb('flist', 'Root', () => navto('/'), breadcrumbs);
                crumbs.forEach((crumb, index) => {
                    currentp += crumb + '/';
                    tk.cb('flists', '/', undefined, breadcrumbs);
                    tk.cb('flist', crumb, () => {
                        let newPath = crumbs.slice(0, index + 1).join('/');
                        navto('/' + newPath + "/");
                    }, breadcrumbs);
                    fuck = path;
                });

                win.main.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });

                win.main.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    const text = e.dataTransfer.getData('text/plain');
                    const move1 = await fs.read(text);
                    const relativePath = text.split('/').pop();
                    await fs.write(fuck + relativePath, move1);
                    navto(fuck);
                    console.log(`Niggle chiggles`);
                });

                const thing = await fs.ls(path);
                thing.items.forEach(function (thing) {
                    if (thing.type === "folder") {
                        const selfdestruct = tk.cb('flist width', "Folder: " + thing.name, () => navto(thing.path + "/"), items);
                    } else {
                        if (thing.name == "") {
                            return;
                        }
                        const selfdestruct = tk.cb('flist width', "File: " + thing.name, async function () {
                            const yeah = await fs.read(thing.path);
                            const menu = tk.c('div', document.body, 'cm');
                            tk.p(thing.path, 'bold', menu);
                            if (thing.path.includes('/system')) {
                                tk.p('This is a system file, modifying it will likely cause damage.', 'warn', menu);
                            }
                            if (thing.path.includes('/user/info/name')) {
                                tk.p('Deleting this file will erase your data on next restart.', 'warn', menu);
                            }
                            tk.cb('b1 b2', 'Open', async function () {
                                const yeah = await fs.read(thing.path);
                                if (yeah.includes('data:video') || yeah.includes('data:image') || yeah.includes('data:audio')) {
                                    app.imgview.init(yeah);
                                } else {
                                    app.textedit.init(yeah, thing.path);
                                }
                            }, menu);
                            tk.cb('b1 b2', 'Open with', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                tk.cb('b1 b2', 'Iris Media Viewer', function () {
                                    app.imgview.init(yeah);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1 b2', 'Text Editor', function () {
                                    app.textedit.init(yeah, thing.path);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1 b2', 'console.log', function () {
                                    console.log(yeah);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                            }, menu);
                            tk.cb('b1 b2', 'Download', function () {
                                wd.download(yeah, `WebDesk File ${gen(4)}`);
                                ui.dest(menu);
                            }, menu);
                            tk.cb('b1 b2', 'Rename/Move', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const inp = tk.c('input', menu2, 'i1');
                                inp.placeholder = "Enter new path";
                                inp.value = thing.path;
                                tk.cb('b1 b2', 'Rename/Move', function () {
                                    fs.write(inp.value, yeah);
                                    fs.del(thing.path, yeah);
                                    navto(path);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                            }, menu);
                            tk.cb('b1 b2', 'Delete file', function () {
                                fs.del(thing.path);
                                ui.dest(selfdestruct);
                                ui.dest(menu);
                            }, menu);
                            tk.cb('b1', 'Cancel', function () {
                                ui.dest(menu);
                            }, menu);
                        }, items);
                        selfdestruct.addEventListener('dragstart', (e) => {
                            e.dataTransfer.setData('text/plain', thing.path);
                        });
                        selfdestruct.draggable = true;
                        /* tk.cb('b5', 'Open', async function () {
                            const yeah = await fs.read(thing.path);
                            if (yeah.includes('data:video') || yeah.includes('data:image') || yeah.includes('data:audio')) {
                                app.imgview.init(yeah);
                            } else {
                                app.textedit.init(yeah, thing.path);
                            }
                        }, selfdestruct); */
                    }
                });
            }

            if (oppath) {
                navto('/');
                console.log(`<!> Don't specify a custom path in Files, there's a silly issue rn`);
            } else {
                navto('/');
            }
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
            tk.p('WebDesk', 'h2', info);
            tk.p(`Updated: ${abt.lastmod}`, undefined, info);
            tk.p(`DeskID: ${sys.deskid}`, undefined, info);
            tk.p(`Version: ${abt.ver}`, undefined, info);
            /* fs.space().then(result => {
                console.log(result);
                const prog1 = tk.c('div', info, 'progress-bar');
                const prog2 = tk.c('div', prog1, 'progress');
                prog2.style.width = result.usedprct + "%";
            }).catch(err => {
                console.error(err);
            }); */
        }
    },
    backup: {
        runs: true,
        name: 'Data Assistant',
        init: async function () {
            const win = tk.mbw('Data Assistant', '300px', 'auto', true, undefined, undefined);
            tk.p(`Your apps will close, and unsaved data will be lost.`, undefined, win.main);
            tk.cb('b1 b2', 'Migrate', async function () {
                await fs.write('/system/migval', 'down');
                ui.show(document.getElementById('death'), 400);
                setTimeout(reboot, 390);
            }, win.main);
        }
    },
    echoclient: {
        runs: true,
        name: 'EchoDesk',
        init: async function () {
            const win = tk.mbw('EchoDesk', '300px', 'auto', true, undefined, undefined);
            tk.p(`If you're connecting: Enter the EchoDesk ID and hit "Connect". The other WebDesk will appear as a window.`, undefined, win.main);
            tk.p(`If you're the host: Click "Enter EchoDesk Mode". Your apps will close, unsaved data will be lost.`, undefined, win.main);
            tk.cb('b1 b2', 'Enter EchoDesk mode', async function () {
                await fs.write('/system/migval', 'echo');
                ui.show(document.getElementById('death'), 400);
                setTimeout(reboot, 390);
            }, win.main);
            tk.p(`Connecting`, undefined, win.main);
            const input = tk.c('input', win.main, 'i1');
            input.placeholder = "Enter EchoDesk ID";
            tk.cb('b1 b2', 'Connect', async function () {
                /* const the = tk.mbw('EchoDesk Viewer', '100%', '100%', undefined, undefined, undefined);
                const frame = tk.c('embed', the.main, 'embed');
                frame.style.height = "90%";
                frame.src = "./echodesk.html?deskid=" + input.value; */
                app.browser.init("./echodesk.html?deskid=" + input.value);
            }, win.main);
        }
    },
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
            if (apps) {
                const ok = await execute(`https://appmarket.meower.xyz` + apploc);
                const newen = { name: app.name, ver: app.ver, id: Date.now(), exec: ok };
                const jsondata = JSON.parse(apps);
                const check = jsondata.some(entry => entry.name === newen.name);
                if (check === true) {
                    console.log('<i> Already installed');
                    wm.wal('<p>Already installed!</p>')
                } else {
                    jsondata.push(newen);
                    if (update === true) {
                        wm.notif(`Updated: `, app.name);
                    } else {
                        wm.notif(`Installed: `, app.name);
                    }
                    fs.write('/system/apps.json', jsondata);
                }
            } else {
                const ok = await execute(`https://appmarket.meower.xyz` + apploc);
                await fs.write('/system/apps.json', [{ name: app.name, ver: app.ver, id: Date.now(), exec: ok }]);
                wm.notif(`Installed: `, app.name);
            }
        },
        init: async function () {
            const win = tk.mbw('App Market', '340px', 'auto', true, undefined, undefined);
            const apps = tk.c('div', win.main);
            const appinfo = tk.c('div', win.main, 'hide');
            async function loadapps() {
                try {
                    const response = await fetch(`https://appmarket.meower.xyz/refresh`);
                    const apps = await response.json();
                    apps.forEach(function (app2) {
                        const notif = tk.c('div', win.main, 'notif2');
                        tk.p(`<span class="bold">${app2.name}</bold> by ${app2.pub}`, 'bold', notif);
                        tk.p(app2.info, undefined, notif);
                        notif.addEventListener('click', async function () {
                            app.appmark.create(app2.path, app2);
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            tk.p('Welcome to the App Market!', undefined, apps);
            tk.p(`Look for things you might want, all apps have <span class="bold">full access</span> to this WebDesk/it's files. Anything in this store is safe.`, undefined, apps);
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
            tk.p(`WebDesk Achievements`, 'h2', win.main);
            tk.p(`Unlocked <span class="b achcount"></span> achievements`, undefined, win.main);
            await load();
        },
        unlock: async function (name, content) {
            try {
                const data = await fs.read('/user/info/achieve.json');
                if (data) {
                    const newen = { name: name, cont: content, time: Date.now() };
                    const jsondata = JSON.parse(data);
                    const check = jsondata.some(entry => entry.name === newen.name);
                    if (check === true) {
                        console.log('<i> Already achieved!');
                    } else {
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
    browser: {
        runs: true,
        name: 'Browser',
        init: async function (path) {
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw('Browser', '80vw', '82vh', true);
            ui.dest(win.title, 0);

            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const okiedokie = tk.c('div', tabs, 'browsertitle');
            const searchbtns = tk.c('div', okiedokie, 'tnav');
            const searchnest = tk.c('div', tabs, 'title');
            let thing = [];

            let currentTab = tk.c('div', win.main, 'hide');
            let currentBtn = tk.c('div', win.main, 'hide');
            let currentName = tk.c('div', win.main, 'hide');
            win.main.classList = "browsercont";

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
                }, btnnest);
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
                setTimeout(function () {
                    const currentUrl = currentTab.src;
                    if (currentUrl !== lastUrl) {
                        lastUrl = currentUrl;
                        urls.push(currentUrl);
                        thing = [...urls];
                    }
                }, 200);
            }

            tk.cb('b4 browserbutton', '+', addtab, searchbtns);
            tk.cb('b4 rb browserbutton', 'x', function () {
                ui.dest(win.win, 150);
                ui.dest(win.tbn, 150);
            }, btnnest);
            tk.cb('b4 yb browserbutton', '-', function () {
                ui.hide(win.win, 150);
            }, btnnest);
            tk.cb('b4 browserbutton', '⟳', function () {
                currentTab.src = currentTab.src;
            }, searchbtns);
            tk.cb('b4 browserbutton', '<', function () {
                let omfg = thing.length - 2
                currentTab.url = omfg;
            }, searchbtns);
            tk.cb('b4 browserbutton', '>', function () {
                currentTab.contentWindow.history.go(1);
            }, searchbtns);
            const searchInput = tk.c('input', okiedokie, 'i1 browserbutton');
            searchInput.placeholder = "Enter URL";
            tk.cb('b4 browserbutton', 'Go!', function () {
                currentTab.src = "https://" + searchInput.value;
                currentBtn.innerText = searchInput.value;
                if (searchInput.value.includes('porn') || searchInput.value.includes('e621') || searchInput.value.includes('rule34') || searchInput.value.includes('r34') || searchInput.value.includes('xvideos') || searchInput.value.includes('c.ai') || searchInput.value.includes('webtoon')) {
                    app.ach.unlock('The Gooner', `We won't judge — we promise.`);
                }
            }, okiedokie);

            setTimeout(function () {
                if (path) {
                    addtab(path);
                } else {
                    addtab();
                }
            }, 250);
            wd.win();
        }
    },
    webcall: {
        runs: true,
        name: 'WebCall',
        init: async function () {
            const win = tk.mbw('WebCall', '260px', 'auto', true, undefined, undefined);
            const callStatus = tk.p(`Enter DeskID of person to call`, undefined, win.main);
            const input = tk.c('input', win.main, 'i1');
            input.placeholder = "DeskID here";

            function go() {
                let oncall = false;
                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    remotePeerId = input.value;
                    const call = sys.peer.call(remotePeerId, stream);
                    callStatus.textContent = 'Waiting for answer...';
                    const showyourself = sys.peer.connect(call.peer);
                    showyourself.on('open', () => {
                        showyourself.send(JSON.stringify({ type: 'request' }));
                    });

                    showyourself.on('data', (data) => {
                        try {
                            const parsedData = JSON.parse(data);
                            if (parsedData.response) {
                                setTimeout(() => {
                                    if (!oncall) {
                                        callStatus.textContent = `Other person didn't answer`;
                                        call.close();
                                    }
                                }, 28000);

                                call.on('stream', (remoteStream) => {
                                    oncall = true;
                                    ui.dest(win.tbn, 100);
                                    ui.dest(win.win, 100);
                                    app.webcall.answer(remoteStream, call, parsedData.response);
                                });

                                call.on('error', (err) => {
                                    callStatus.textContent = 'Call failed: ' + err.message;
                                });
                            }
                        } catch (err) {
                            console.error('Failed to parse data:', err);
                        }
                    });
                }).catch((err) => {
                    console.error(`<!> ${err}`);
                });
            }

            tk.cb('b1', 'Call', function () {
                go();
            }, win.main);
        },
        answer: async function (remoteStream, call, name) {
            const win = tk.mbw('WebCall', '250px', 'auto', true, undefined, undefined);
            const stat = tk.ps(`WebCall - ${name}`, undefined, win.main);
            const audioElement = tk.c('audio', win.main, 'hide');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.controls = true;
            let isMuted = false;
            const remoteAudioTrack = remoteStream.getAudioTracks()[0];
            const muteButton = tk.cb('b1', 'Mute', function () {
                if (isMuted) {
                    remoteAudioTrack.enabled = true;
                    muteButton.textContent = 'Mute';
                } else {
                    remoteAudioTrack.enabled = false;
                    muteButton.textContent = 'Unmute';
                }
                isMuted = !isMuted;
            }, win.main);

            function crashout() {
                call.close();
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

            win.closebtn.addEventListener('click', function () {
                crashout();
            });
        }
    }
};
