var app = {
    settings: {
        runs: true,
        name: 'Settings',
        init: async function () {
            const main = tk.mbw('Settings', '300px', 'auto', true, undefined, undefined);
            const generalPane = tk.c('div', main.main, 'hide');
            const appearPane = tk.c('div', main.main, 'hide');
            const userPane = tk.c('div', main.main, 'hide');
            const mainPane = tk.c('div', main.main);
            // Main pane
            tk.p('Settings', undefined, mainPane);
            tk.cb('b1 b2', 'General', () => ui.sw2(mainPane, generalPane), mainPane);
            tk.cb('b1 b2', 'WebDesk User', () => ui.sw2(mainPane, userPane), mainPane);
            tk.cb('b1 b2', 'Appearance', () => ui.sw2(mainPane, appearPane), mainPane);
            // General pane
            tk.p('General', undefined, generalPane);
            tk.cb('b1 b2 red', 'Erase This WebDesk', () => app.eraseassist.init(), generalPane);
            tk.cb('b1 b2 red', 'Remove All App Market Apps', () => wm.wal(`<p>Warning: Removing all App Market apps will cause a reboot and delete them, but their data will remain.</p>`, async function () {
                await fs.del('/system/apps.json');
                wd.reboot();
            }, 'Okay'), generalPane);
            const earth = tk.cb('b1 b2', 'Enable Earthquake Mode (Restarting stops it)', function () {
                const style = document.createElement('style');
                style.innerHTML = `
                    div, button, p {
                        display: inline-block;
                        animation: wiggle 0.26s infinite !important;
                    }
                `;
                document.head.appendChild(style);
                const sigma = ui.play('/assets/other/quake.mp3');
                sigma.loop = true;
                app.ach.unlock('Japan Simulator', `Maybe reconsider living there?`);
            }, generalPane);
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
            tk.p('WebDesk User', undefined, userPane);
            tk.cb('b1 b2', 'Change Username', function () {
                const ok = tk.mbw('Change Username', '300px', 'auto', true, undefined, undefined);
                const inp = tk.c('input', ok.main, 'i1');
                inp.placeholder = "New name here";
                tk.cb('b1', 'Change name', async function () {
                    await fs.write('/user/info/name', inp.value);
                    ok.main.innerHTML = `<p>Reboot WebDesk to finish changing your username.</p><p>All unsaved data will be lost.</p>`;
                    tk.cb('b1', 'Reboot', () => wd.reboot(), ok.main);
                }, ok.main);
            }, userPane);
            tk.cb('b1 b2', 'Change DeskID', function () {
                const ok = tk.mbw('Change DeskID', '300px', 'auto', true, undefined, undefined);
                tk.p(`Changing your DeskID will make your WebDesk unreachable to those without your new ID.`, undefined, ok.main);
                tk.cb('b1', 'Continue', async function () {
                    const newid = await wd.newid();
                    ok.main.innerHTML = `<p>Reboot WebDesk to finish changing your DeskID.</p><p>All unsaved data will be lost. Your new ID is ${newid}.</p>`;
                    tk.cb('b1', 'Reboot', () => wd.reboot(), ok.main);
                }, ok.main);
            }, userPane);
            tk.cb('b1', 'Back', () => ui.sw2(userPane, mainPane), userPane);
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
            tk.p(`Use the ID below/scan the QR code to start your WebDesk on another WebDesk. The other person will have full access to your files.`, undefined, first);
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
                wd.desktop('Guest', gen(8));
                wm.notif('Welcome to WebDesk!', `You've logged in as a guest, so WebDesk will be erased on reload and some features won't be available.`)
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
                correctLevel: QRCode.CorrectLevel.H
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
            tk.cb('b4', 'Force Exit', () => wm.wal(
                `<p>If WebDesk is stuck, use this to leave.</p>
                <p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`,
                () => reboot(),
                'Force Exit'
            ), tnav);

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
            tk.cb('b1', 'Erase', function () { app.eraseassist.init(); }, sum);
            tk.cb('b1', 'Done', function () { wd.reboot(); }, sum);
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
            } else if (contents.includes('data:application/pdf')) {
                wm.notif(`WebDesk can't view PDFs`, 'Open PDF in a new tab?', () => window.open(contents, '_blank'));
            }
        }
    },
    textedit: {
        runs: true,
        name: 'TextEdit',
        init: async function (contents, path) {
            if (!path) {
                const ok = tk.c('div', document.body, 'cm');
                tk.p('Start new document', undefined, ok);
                const inp = tk.c('input', ok, 'i1');
                inp.placeholder = "File path e.g /user/files/doc.txt";
                tk.cb('b1', 'Cancel', function () {
                    ui.dest(ok);
                }, ok);
                tk.cb('b1', 'Create', function () {
                    app.textedit.init('', inp.value);
                    ui.dest(ok);
                }, ok);
                return;
            }
            tk.css('./assets/lib/browse.css');
            const win = tk.mbw(`TextEdit`, '500px', '340px', true);
            ui.dest(win.title, 0);
            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const editdiv = tk.c('div', win.main, 'browsertab');
            editdiv.style.display = "block";
            editdiv.style.borderRadius = "0px";
            win.main.classList = "browsercont";
            tk.cb('b4 rb browserbutton', 'x', function () {
                ui.dest(win.win, 150);
                ui.dest(win.tbn, 150);
            }, btnnest);
            tk.cb('b4 yb browserbutton', '-', function () {
                ui.hide(win.win, 150);
            }, btnnest);
            const genit = gen(8);
            editdiv.id = genit;
            const editor = ace.edit(`${genit}`);
            editor.setFontSize("var(--fz3)");
            editor.session.setOption("wrap", true);
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
            tk.cb('b4 browserbutton', 'Save', async function () {
                await save();
            }, btnnest);
            tk.cb('b4 browserbutton', 'Menu', async function () {
                const menu = tk.c('div', document.body, 'cm');
                tk.p(`Menu`, undefined, menu);
                tk.cb('b1 b2', 'Select All', function () {
                    editor.selectAll();
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1 b2', 'Replace', function () {
                    editor.execCommand('replace');
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1 b2', 'Find', function () {
                    editor.execCommand('find');
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1', 'Undo', function () {
                    editor.execCommand('undo');
                }, menu);
                tk.cb('b1', 'Close', function () {
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1', 'Redo', function () {
                    editor.execCommand('redo');
                }, menu);
            }, btnnest);
            wd.win();
            editor.container.addEventListener('keydown', async function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    await save();
                }
            });
            new ResizeObserver(() => {
                editor.resize();
            }).observe(win.win);
            win.closebtn.addEventListener('mousedown', function () {
                clearInterval(colorch);
            });
        }
    },
    files: {
        runs: true,
        name: 'Files',
        init: async function () {
            const win = tk.mbw(`Files`, '340px', 'auto', true, undefined, undefined);
            const breadcrumbs = tk.c('div', win.main);
            const items = tk.c('div', win.main);
            var fuck = undefined;
            let dragoverListener = null;
            let dropListener = null;
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

                fuck = currentPath;

                if (dragoverListener) items.removeEventListener('dragover', dragoverListener);
                if (dropListener) items.removeEventListener('drop', dropListener);

                dragoverListener = e => e.preventDefault();
                dropListener = async e => {
                    e.preventDefault();
                    const text = e.dataTransfer.getData('text/plain');
                    const move1 = await fs.read(text);
                    const relativePath = text.split('/').pop();
                    await fs.write(currentPath + relativePath, move1);
                    setTimeout(() => navto(currentPath), 300);
                };

                items.addEventListener('dragover', dragoverListener);
                items.addEventListener('drop', dropListener);

                const thing = await fs.ls(path);
                thing.items.forEach(function (thing) {
                    if (thing.type === "folder") {
                        const selfdestruct = tk.cb('flist width', "Folder: " + thing.name, () => navto(thing.path + "/"), items);
                    } else {
                        if (thing.name == "") {
                            return;
                        }
                        const selfdestruct = tk.cb('flist width', "File: " + thing.name, async function () {
                            const skibidi = tk.c('div', document.body, 'cm');
                            skibidi.innerText = `Loading ` + thing.name + ", this might take a bit";
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
                                ui.dest(menu);
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
                            tk.cb('b1 b2', 'WebDrop', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const inp = tk.c('input', menu2, 'i1');
                                inp.placeholder = "Enter DeskID";
                                tk.cb('b1 b2', 'WebDrop', async function () {
                                    menu2.innerHTML = `<p class="bold">Sending file</p><p>Depending on the size, this might take a bit</p>`;
                                    tk.cb('b1', 'Close (No status updates)', function () {
                                        ui.dest(menu2);
                                    }, menu2);
                                    await custf(inp.value, thing.name, yeah).then((check) => {
                                        if (check === true) {
                                            menu2.innerHTML = `<p class="bold">File sent</p><p>The other person can accept or deny</p>`;
                                            tk.cb('b1', 'Close', function () {
                                                ui.dest(menu2);
                                            }, menu2);
                                        } else {
                                            menu2.innerHTML = `<p class="bold">An error occured</p><p>Make sure the ID is correct</p>`;
                                            tk.cb('b1', 'Close', function () {
                                                ui.dest(menu2);
                                            }, menu2);
                                        }
                                    });
                                }, menu2);
                                tk.cb('b1', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                            }, menu);
                            tk.cb('b1 b2', 'Rename/Move', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const inp = tk.c('input', menu2, 'i1');
                                inp.placeholder = "Enter new path";
                                inp.value = thing.path;
                                tk.cb('b1', 'Cancel', function () {
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Rename/Move', function () {
                                    fs.write(inp.value, yeah);
                                    fs.del(thing.path, yeah);
                                    navto(path);
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
                            ui.dest(skibidi);
                        }, items);
                        selfdestruct.addEventListener('dragstart', (e) => {
                            e.dataTransfer.setData('text/plain', thing.path);
                        });
                        selfdestruct.draggable = true;
                    }
                });
            }

            navto('/user/files/');
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
            tk.p(`<span class="bold">Updated</span> ${abt.lastmod}`, undefined, info);
            tk.p(`<span class="bold">DeskID</span> ${sys.deskid}`, undefined, info);
            tk.p(`<span class="bold">Version</span> ${abt.ver}`, undefined, info);
            tk.cb('b2 b4', 'Credits', function () {
                const ok = tk.c('div', document.body, 'cm');
                ok.innerHTML = `<p class="bold">Credits</p>
                <p>All the libraries or materials that helped create WebDesk.</p>
                <p><a href="https://peerjs.com/" target="blank">PeerJS: DeskID/online services</a></p>
                <p><a href="https://davidshimjs.github.io/qrcodejs/" target="blank">qrcode.js: Any WebDesk QR codes</a></p>
                <p><a href="https://jquery.com/" target="blank">jQuery: WebDesk's UI</a></p>
                <p><a href="https://ace.c9.io/" target="blank">Ace: TextEdit's engine</a></p>
                <p><a href="https://jscolor.com/" target="blank">jscolor: Color picker</a></p>`;
                tk.cb('b1', 'Close', function () {
                    ui.dest(ok, 200);
                }, ok);
            }, info);
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
                tk.cb('b1 b2', 'Migrate', async function () {
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
    echoclient: {
        runs: true,
        name: 'EchoDesk',
        init: async function () {
            const win = tk.mbw('EchoDesk', '300px', 'auto', true, undefined, undefined);
            if (sys.guest === true) {
                tk.p(`Enter the EchoDesk ID and hit "Connect". The other WebDesk will appear as a window. <span class="bold">You're in Guest mode, so you can't enter EchoDesk mode.</span>`, undefined, win.main);
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
            tk.p(`Remember: These are jokes and don't actually do anything`, undefined, win.main);
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
        init: async function (path2) {
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
            const win = tk.mbw(`Embedder - ` + path2, '80vw', '82vh', true);
            ui.dest(win.title, 0);
            const tabs = tk.c('div', win.main, 'tabbar d');
            const btnnest = tk.c('div', tabs, 'tnav');
            const tab = tk.c('embed', win.main, 'browsertab');
            win.main.classList = "browsercont";
            tk.cb('b4 rb browserbutton', 'x', function () {
                ui.dest(win.win, 150);
                ui.dest(win.tbn, 150);
            }, btnnest);
            tk.cb('b4 yb browserbutton', '-', function () {
                ui.hide(win.win, 150);
            }, btnnest);
            tk.cb('b4 browserbutton', '⟳', function () {
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
                                    app.webcall.answer(remoteStream, call, parsedData.response, stream);
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
        answer: async function (remoteStream, call, name, fein) {
            const win = tk.mbw('WebCall', '250px', 'auto', true, undefined, undefined);
            const stat = tk.ps(`WebCall - ${name}`, undefined, win.main);
            const audioElement = tk.c('audio', win.main, 'hide');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.controls = true;

            let isMuted = false;
            const remoteAudioTrack = remoteStream.getAudioTracks()[0];

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

            win.closebtn.addEventListener('mousedown', function () {
                crashout();
            });
        }
    },
};
