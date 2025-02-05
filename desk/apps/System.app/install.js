app['system'] = {
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
            tk.img('/system/lib/img/setup/first.svg', 'setupi', first);
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
            main.style.height = "425px";
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Force Exit', () => wm.wal(`<p>If WebDesk is stuck, use this to leave.</p><p>Note: If you have lots of files or a slow connection, it's normal for things to take a while.</p>`, () => reboot(), 'Force Exit'), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('/system/lib/img/setup/first.svg', 'setupi', first);
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
        init: function (isid, id) {
            const main = tk.c('div', tk.g('setuparea'), 'setupbox');
            // create setup menubar
            const bar = tk.c('div', main, 'setupbar');
            const tnav = tk.c('div', bar, 'tnav');
            const title = tk.c('div', bar, 'title');
            tk.cb('b4', 'Start Over', () => app.settings.eraseassist.init(), tnav);
            tk.cb('b4 time', 'what', undefined, title);
            // first menu
            const first = tk.c('div', main, 'setb');
            tk.img('/system/lib/img/setup/first.svg', 'setupi', first);
            function defaultsetup() {
                tk.p('Welcome to WebDesk', 'h2', first);
                /* tk.cb('b1', `EchoDesk`, function () {
                    const echotemp = tk.c('div', main, 'setb hide');
                    tk.img('/system/lib/img/setup/quick.png', 'setupi', echotemp);
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
                    wd.desktop('Guest', 'min');
                    fs.write('/user/files/Welcome to WebDesk!.txt', `Welcome to WebDesk! This is your Files folder, where things you upload are stored. Use the buttons at the top to navigate between folders, right-click/tap and hold a file to see it's info, and normal tap/click it to open it.`);
                    wm.notif('Welcome to WebDesk!', `You're logged in as a guest. Keep in mind, WebDesk will erase itself on reload, and some features may be limited.`);
                }, first); */
                tk.cb('b1', `What is WebDesk?`, () => app.textedit.init(`WebDesk is like a desktop in your browser.
It saves its files to your browser, so everything is done locally.
WebDesk also has an app to call, message or share files with people, called WebComm.
To use WebDesk, or copy data, hit "Continue".`, undefined, true), first);
                tk.cb('b1', `Continue`, () => ui.sw2(first, transfer), first);
            }
            if (isid !== true) {
                defaultsetup();
            } else {
                tk.p('Welcome to WebDesk!', 'h2', first);
                tk.p(`WebDesk is like a desktop right in your browser. Someone shared their ID with you, so set up a user to talk to them!`, undefined, first);
                tk.cb('b1 b2', 'Set up WebDesk', function () {
                    defaultsetup();
                }, first);
                /* const split3 = tk.c('div', first, 'split');
                const id23 = tk.c('div', split3, 'splititem');
                tk.p('Set up WebDesk', 'h2', id23);
                tk.p(`Take a moment to set things up. You'll get to pick a name and start talking once you're ready.`, undefined, id23);
                tk.cb('b1 b2', 'Set up WebDesk', function () {
                    defaultsetup();
                }, id23);
                const ok = tk.c('div', split3, 'splititem');
                tk.p('Continue as Guest', 'h2', ok);
                tk.p(`Skip the setup and talk as a guest. You'll be able to start talking immediately.`, undefined, ok);
                tk.cb('b1 b2', 'Talk as Guest', function () {
                    sys.guest = true;
                    sys.name = "Guest";
                    wd.desktop('Guest', 'min');
                    fs.write('/user/files/Welcome to WebDesk!.txt', `Welcome to WebDesk! This is your Files folder, where uploaded items are stored. Use the buttons at the top to navigate folders, right-click/tap and hold a file for info, or click/tap it to open.`);
                    wm.notif('Welcome to WebDesk!', `You're logged in as a guest. Keep in mind, WebDesk will erase itself on reload, and some features may be limited.`);
                }, ok); */
            }
            // migrate menu
            const transfer = tk.c('div', main, 'setb hide');
            tk.img('/system/lib/img/setup/quick.png', 'setupi', transfer);
            tk.p('Quick Start', 'h2', transfer);
            tk.p(`If you don't have another WebDesk, hit "No thanks".`, undefined, transfer);
            tk.p('To copy your data, just scan the QR code, or open Migrate on the other WebDesk, hit "Migrate", and enter this code:', undefined, transfer);
            const split = tk.c('div', transfer, 'split');
            const id2 = tk.c('div', split, 'splititem');
            tk.p('--------', 'h2 deskid', id2);
            sys.model = tk.p(`Waiting for other WebDesk`, undefined, id2);
            tk.cb('b1', `No thanks`, () => ui.sw2(transfer, warn), id2);
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
            tk.img('/system/lib/img/setup/restore.svg', 'setupi', copy);
            tk.p('Restoring from other WebDesk', 'h2', copy);
            tk.p('Do not touch the other WebDesk, it could interrupt the copying process.', undefined, copy);
            tk.p(`It's normal for this to take an unreasonable amount of time sometimes.`, undefined, copy);
            el.migstat = tk.p('Starting...', 'restpg', copy);
            tk.cb('b1', 'Cancel', function () { fs.erase('reboot'); }, copy);
            copy.id = "quickstartwdgoing";
            // warn menu
            const warn = tk.c('div', main, 'setb hide');
            tk.img('/system/lib/img/noround.png', 'setupi', warn);
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
            tk.img('/system/lib/img/setup/user.svg', 'setupi', user);
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
            tk.img('/system/lib/img/setup/check.svg', 'setupi', sum);
            tk.p('All done!', 'h2', sum);
            tk.p('Make sure to check Settings for more options.', undefined, sum);
            tk.cb('b1', 'Erase & restart', function () { app.settings.eraseassist.init(); }, sum); tk.cb('b1', 'Finish', function () { wd.reboot(); }, sum);
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
            tk.img('/system/lib/img/setup/quick.png', 'setupi', transfer);
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
            tk.img('/system/lib/img/setup/check.svg', 'setupi', sum);
            tk.p('Finishing Up', 'h2', sum);
            tk.p(`Wait for the other WebDesk to finish before hitting "Done" or "Erase".`, undefined, sum);
            tk.p(`It's normal for this to take an unreasonable amount of time sometimes.`, undefined, sum);
            tk.cb('b1', 'Erase', function () { app.settings.eraseassist.init(); }, sum);
            tk.cb('b1', 'Done', function () { wd.reboot(); }, sum);
            sum.id = "setupdone";
        }
    },
};