let fire = false;
async function startsockets() {
    const devsocket = await fs.read('/system/info/devsocket');
    return new Promise((resolve) => {
        try {
            if (sys.socket) {
                sys.socket.disconnect();
                sys.socket = undefined;
            }

            if (devsocket === "true") {
                sys.socket = io('wss://webdeskbeta.meower.xyz/');
                wm.notif('Using beta socket server', 'This is for testing purposes only and might not even be online.');
            } else {
                sys.socket = io("wss://webdesk.meower.xyz/");
            }

            const timeout = setTimeout(() => {
                console.log('<!> Connection timeout: No response in 6 seconds');
                sys.socket.disconnect();
                sys.socket = undefined;
                resolve(false);
            }, 6000);

            if (params.get('listen') === "yes") {
                sys.socket.onAny((event, ...args) => {
                    console.log(`Received event: ${event}`, args);
                });
            }

            sys.socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                console.log('<!> Connection error: ', error);
                sys.socket.disconnect();
                sys.socket = undefined;
                resolve(false);
                webid.priv = -1;
            });

            sys.socket.on("servmsg", (data) => {
                wm.snack(data);
            });

            sys.socket.on("error", (data) => {
                if (data == "No token provided" && sys.setupd === false) {
                    console.log(`<!> Quiet error: ` + data);
                } else {
                    wm.snack(data);
                }
            });

            sys.socket.on("force_update", (data) => {
                window.location.reload();
            });

            sys.socket.on("connect", async () => {
                clearTimeout(timeout);
                const token = await fs.read('/user/info/token');
                console.log('<i> Connected to WebDesk server');
                if (token) {
                    sys.socket.emit("login", token);
                } else {
                    console.log('<!> No token');
                }
                resolve(true);
            });

            sys.socket.on("checkback", async (thing) => {
                if (thing.error === true) {
                    await fs.del('/user/info/token');
                    window.location.reload();
                } else {
                    sys.name = thing.username;
                    sd = thing.username;
                    await set.set('name', thing.username);
                    webid.token = await fs.read('/user/info/token');
                    webid.priv = thing.priv;
                    webid.userid = thing.userid;
                    if (thing.priv === 0) {
                        wm.notif('Your account has been limited.', `You can still use WebDesk normally, but you can't use online services.`);
                    }
                    console.log(`<i> Logged in!
- Username: ${thing.username}
- Account permission level: ${thing.priv}
- UserID: ${thing.userid}
- Token: ${ui.truncater(webid.token, 8)}`);
                }
                resolve(true);
            });

            sys.socket.on("webcall", async (call) => {
                const notif = wm.notif('Call from ' + call.username, undefined, async function () {
                    app.webcomm.webcall.init(call.username, call.deskid, call.id);
                }, 'Answer');
                setTimeout(function () {
                    if (notif) {
                        ui.dest(notif.div);
                    }
                }, 15000);
            });

            var recsock = [];

            sys.socket.on("umsg", async (msg) => {
                if (!recsock[msg.username]) {
                    recsock[msg.username] = [];
                }

                recsock[msg.username].push(msg.contents);

                if (random[msg.username]) {
                    await app.webcomm.webchat.init(msg.username, [msg.contents], false);
                } else {
                    if (random[msg.username + "notif"]) {
                        ui.dest(random[msg.username + "notif"]);
                    }

                    const notif = wm.notif(msg.username, msg.contents, async function () {
                        random[msg.username] = tk.mbw('WebChat', '300px', 'auto', true);
                        random[msg.username].messaging = tk.c('div', random[msg.username].main);
                        random[msg.username].chatting = tk.c('div', random[msg.username].messaging, 'embed nest message-container');
                        random[msg.username].chatting.style.overflow = "auto";
                        random[msg.username].chatting.style.height = "320px";
                        tk.ps(`Talking with ${msg.username}`, 'smtxt', random[msg.username].chatting);

                        if (sys.filter === true) {
                            tk.ps(`Some filters can detect things YOU send, as they monitor your typing.`, 'smtxt', random[msg.username].chatting);
                        }

                        random[msg.username].containchatdiv = tk.c('div', random[msg.username].messaging);
                        random[msg.username].containchatdiv.style.display = "flex";

                        random[msg.username].input = tk.c('input', random[msg.username].containchatdiv, 'i1 tnav');
                        random[msg.username].input.placeholder = "Message " + msg.username;

                        function send() {
                            const message = random[msg.username].input.value;
                            if (message) {
                                sys.socket.emit("message", { token: webid.token, username: msg.username, contents: message });
                                const div = tk.c('div', random[msg.username].chatting, 'msg mesent');
                                div.innerText = ui.filter(message);
                                div.style.marginBottom = "3px";
                                random[msg.username].input.value = '';
                                random[msg.username].chatting.scrollTop = random[msg.username].chatting.scrollHeight;
                            }
                        }

                        random[msg.username].containchatdiv.style.marginTop = "5px";

                        tk.cb('b1 title resist', 'Send', () => send(), random[msg.username].containchatdiv);
                        ui.key(random[msg.username].input, "Enter", () => send());

                        random[msg.username].closebtn.addEventListener('mousedown', function () {
                            random[msg.username] = undefined;
                        });

                        app.webcomm.add(msg.username);
                        app.webcomm.webchat.init(msg.username, recsock[msg.username], true);
                    }, 'Open');

                    random[msg.username + "notif"] = notif.div;
                }

                random[msg.username].closebtn.addEventListener('mousedown', function () {
                    recsock[msg.username] = undefined;
                });
            });
        } catch (error) {
            console.log(error);
            if (sys.socket) {
                sys.socket.disconnect();
                sys.socket = undefined;
            }
            resolve(false);
        }
    });
}

async function bootstage2(uid2, eepysleepy, migcheck, sd, installed, lebronjames) {
    try {
        try {
            await initscript('/system/apps.js');
            await initcss('/system/lib/layout1.css');
            await initcss('/system/lib/crop/cropper.css');
            await initscript('/system/lib/jq.js');
            await initscript('/system/lib/socket.io.js');
            await initscript('/system/lib/peer.js');
            await initscript('/system/lib/qrcode.js');
            await initscript('/system/lib/ace/ace.js');
            await initscript('/system/lib/ace/ext-searchbox.js');
            await initscript('/system/lib/ace/theme-monokai.js');
            await initscript('/system/lib/picker.js');
            await initscript('/system/core.js');
            await initscript('/system/wm.js');
            await initscript('/system/services.js');
            await initscript('/system/ui.js');
            await initscript('/system/lib/crop/cropper.js');
            sd = await set.read('name');
            sd2 = await fs.read('/user/info/name');
            abt.ver = await fs.read('/system/info/currentver');
            abt.lastmod = await fs.read('/system/info/currentveredit');
            await initcss('/system/style.css');
            await wd.fontsw('/system/lib/fonts/Poppins-Regular.woff2', '/system/lib/fonts/Poppins-Medium.woff2', '/system/lib/fonts/Poppins-Bold.woff2', '/system/lib/fonts/mono.woff2');

            const socketworks = await startsockets();
            if (!socketworks) {
                console.log(socketworks);
                console.log('<!> Socket connection failed, proceeding without socket');
            }

        } catch (error) {
            console.error(error);
        }

        console.log('<i> Boot stage 2: Load variables, make decisions');
        if ((sd || sd2) && !migcheck && params.get('oobe') !== "true") {
            const uid = params.get('deskid');
            if (uid) {
                await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
                await initapps();
                const id = gen(7);
                await ptp.go(id);
                ui.crtheme('#010101', true);
                wd.dark('nosave');
                await fs.del('/system/migval');
                app.system.migrate.init('skibidi');
                ui.dest(tk.g('loading', 220));
                wegood();
                return;
            }

            const [
                darkpref, lightdark, color, font, dev, mob, city, clocksec, apprepo, filtering, notifsound, silent, perf, winopt2, migrated
            ] = await Promise.all([
                set.read('lightdarkpref'),
                set.read('lightdark'),
                set.read('color'),
                set.read('font'),
                fs.read('/system/info/devmode'),
                set.read('mobile'),
                fs.read('/user/info/location.json'),
                set.read('clocksec'),
                fs.read('/system/appurl'),
                set.read('filter'),
                set.read('notifsrc'),
                set.read('silent'),
                set.read('lowgfx'),
                set.read('winopt'),
                set.read('migrated')
            ]);

            await wd.blurcheck(perf);

            if (clocksec === "true") {
                sys.seconds = true;
            } else {
                sys.seconds = false;
            }

            if (city) {
                const ok = JSON.parse(city)[0];
                sys.city = ok.city;
                sys.unit = ok.unit;
                if (ok.unit === "Metric") {
                    sys.unitsym = "°C";
                } else {
                    sys.unitsym = "°F";
                }
                if (ok.default === true) {
                    sys.defaultloc = true;
                } else {
                    sys.defaultloc = false;
                }
                sys.loclast = ok.lastupdate;
            } else {
                wd.wetter();
            }

            await ptp.go(gen(7));

            if (!lebronjames) {
                const [
                    darkpref, lightdark, color, font, mob, clocksec, filtering, notifsound, silent, setupver, setuptime, blur, lowgfx, name
                ] = await Promise.all([
                    fs.read('/user/info/lightdarkpref'),
                    fs.read('/user/info/lightdark'),
                    fs.read('/user/info/color'),
                    fs.read('/user/info/font'),
                    fs.read('/user/info/mobile'),
                    fs.read('/user/info/clocksec'),
                    fs.read('/user/info/filter'),
                    fs.read('/user/info/notifsrc'),
                    fs.read('/user/info/silent'),
                    fs.read('/system/info/setupver'),
                    fs.read('/system/info/setuptime'),
                    fs.read('/user/info/blur'),
                    fs.read('/system/info/lowgfx'),
                    fs.read('/user/info/name'),
                ]);
                await set.set('lightdarkpref', darkpref);
                await set.set('lightdark', lightdark);
                await set.set('color', color);
                await set.set('font', font);
                await set.set('devmode', dev);
                await set.set('mobile', mob);
                await set.set('clocksec', clocksec);
                await set.set('filter', filtering);
                await set.set('notifsrc', notifsound);
                await set.set('silent', silent);
                await set.set('setupver', setupver);
                await set.set('setuptime', setuptime);
                await set.set('blur', blur);
                await set.set('lowgfx', lowgfx);
                await set.set('name', name);
                await fs.del('/user/info/lightdarkpref');
                await fs.del('/user/info/lightdark');
                await fs.del('/user/info/color');
                await fs.del('/user/info/font');
                await fs.del('/user/info/mobile');
                await fs.del('/user/info/clocksec');
                await fs.del('/user/info/filter');
                await fs.del('/user/info/notifsrc');
                await fs.del('/user/info/silent');
                await fs.del('/user/info/blur');
                await fs.del('/system/info/lowgfx');
                await fs.del('/user/info/name');
                await initscript('/apps/Achievements.app/install.js');
                await app.ach.unlock(`Everything Stays`, `Surivive the 0.3.2 update.`);
                await wd.reboot();
            }

            if (eepysleepy === "true") {
                ui.hide(tk.g('contain'), 0);
                await initscript('/apps/Lock Screen.app/install.js');
                sys.setupd = "eepy";
                wegood();
                wd.dark('nosave');
                ui.crtheme('#999999', true);
                app.lockscreen.init();
                await wd.chokehold();
                wakelockgo();
            }

            if (apprepo) sys.appurl = apprepo;
            if (notifsound) sys.notifsrc = notifsound;
            if (silent === "true") sys.nvol = 0;

            if (/Mobi|Android/i.test(navigator.userAgent)) {
                sys.mob = true;
                if (mob !== "false") {
                    sys.mobui = true;
                }
            }

            if (filtering === "true") {
                sys.filter = true;
            } else if (filtering === "nc") {
                sys.filter = true;
                sys.nc = true;
            }

            if (dev === "true") {
                sys.dev = true;
                wm.notif(`Developer Mode is enabled.`);
            }

            if (font === "big") {
                wd.bgft();
            } else if (font === "small") {
                wd.smft();
            } else {
                wd.meft();
            }

            fs.write('/user/files/Welcome to WebDesk!.txt', `Welcome to WebDesk! This is your Files folder, where things you upload are stored. Use the buttons at the top to navigate between folders, right-click/tap and hold a file to see it's info, and normal tap/click it to open it.`);
            sys.setupd = true;
            try {
                const skibidi = await fetch('/target.json');
                const fucker = await skibidi.text();
                const json = await JSON.parse(fucker);
                if (json['0'].target !== abt.ver || json['0'].lastmod !== abt.lastmod || params.get('update') === "yes") {
                    const dark = ui.darken();
                    const menu = tk.c('div', dark, 'cm');
                    tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
                    tk.p('Update WebDesk', 'bold', menu);
                    tk.p('This will only take a few seconds.', undefined, menu);
                    if (params.get('update') === "yes") {
                        tk.p('update=yes is in the URL, this is making this message show', 'warn', menu);
                    }
                    tk.p(abt.ver + " to " + json['0'].target, undefined, menu);
                    tk.cb('b1', 'Later', () => ui.dest(dark), menu); tk.cb('b1', 'Update', async function () {
                        await fs.del('/system/webdesk');
                        reboot();
                    }, menu);
                }
                const token = await fs.read('/user/info/token');
                if (sys.socket === undefined) {
                    wm.notif(`Can't connect to server`, `You can still use WebDesk normally, but you can't use online services.`);
                    webid.priv = -1;
                } else {
                    if (!token) {
                        const dark = ui.darken();
                        const menu = tk.c('div', dark, 'cm');
                        tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
                        tk.p('Log into/make WebDesk account', 'bold', menu);
                        tk.p(`Misuse targeting others may result in account limitations. The developer is not liable for your actions.`, undefined, menu);
                        const useri = tk.c('input', menu, 'i1');
                        const passi = tk.c('input', menu, 'i1');
                        useri.placeholder = 'Username';
                        passi.placeholder = 'Password';
                        passi.type = 'password';
                        tk.cb('b1 nodontdoit', 'Not Now', async function () {
                            ui.dest(dark);
                            webid.priv = -1;
                            wm.notif(`You're logged out`, `You can still use WebDesk, but you can't use online services.`);
                        }, menu);
                        tk.cb('b1', 'Create/Log In', async function () {
                            if (useri.value.length > 16) {
                                wm.snack(`Set a name under 16 characters`, 3200);
                                return;
                            }

                            if (passi.value.length < 8) {
                                wm.snack(`Set a password over 8 characters.`, 3200);
                                return;
                            }

                            sys.socket.emit("newacc", { user: useri.value, pass: passi.value });
                        }, menu);
                        sys.socket.on("token", ({ token }) => {
                            fs.write('/user/info/token', token);
                            wd.reboot();
                        });
                    }
                }
            } catch (error) {
                console.log(error);
                webid.priv = -1;
            }
            if (sys.name === "Default User") {
                sys.name = sd;
            }
            if (darkpref === "auto") {
                sys.autodarkacc = true;
            } else {
                sys.autodarkacc = false;
            }
            if (lightdark === "dark") {
                wd.dark('nosave');
            } else {
                wd.light('nosave');
            }
            if (color) {
                ui.crtheme(color);
            } else {
                wd.seasonal();
            }
            console.log('<i> Boot stage 3: Load apps');
            await initapps();
            if (winopt2 === "2") {
                app.settings.winopt('2');
            }
            console.log('<i> Boot stage 4: Load desktop, check for updates');
            await wd.desktop(sys.name, undefined, 'wait');
            await wd.setbg(false);
            if (migrated === "true") {
                set.del('migrated');
                const div = tk.c('div', document.body, 'cm');
                tk.img('/system/lib/img/setup/check.svg', 'setupi', div);
                tk.p('Migration complete!', 'bold', div);
                tk.p(`This WebDesk is an exact clone of the one you copied from.`, undefined, div);
                tk.p(`If you're not going to use it, wipe the other WebDesk.`, undefined, div);
                tk.cb('b1', 'Got it', () => ui.dest(div), div);
            }
            ui.dest(tk.g('loading', 220));
        } else if (migcheck === "down") {
            await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
            await initapps();
            const id = gen(7);
            await ptp.go(id);
            ui.crtheme('#010101', true);
            wd.dark('nosave');
            await fs.del('/system/migval');
            app.system.migrate.init('down');
            ui.dest(tk.g('loading', 220));
            wegood();
        } else if (migcheck === "echo") {
            await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
            await initapps();
            await wd.setbg(true, false);
            const id = gen(7);
            await ptp.go(id);
            ui.crtheme('#010101', true);
            wd.dark('nosave');
            await fs.del('/system/migval');
            app.system.echodesk.init();
            ui.dest(tk.g('loading', 220));
            wegood();
        } else if (migcheck === "rec") {
            await wd.setbg(undefined, '/system/lib/img/wallpapers/restore/recovery.png');
            await initapps();
            await app.system.recovery.init();
            ui.dest(tk.g('loading', 220));
        } else {
            await initapps();
            await wd.seasonal();
            await wd.setbg();
            const id = await wd.newid();
            await ptp.go(id);
            if (uid2) {
                app.system.setup.init(true, uid2);
            } else {
                app.system.setup.init();
            }
            sys.setupd = false;
            ui.dest(tk.g('loading', 220));
            wegood();
        }

        wd.perfmon();
        ui.hide(tk.g('death'), 140);

        try {
            if (sys.socket !== undefined) {
                let reconnecting = false;
                setInterval(async function () {
                    if (sys.socket === undefined && !reconnecting) {
                        reconnecting = true;
                        console.log('<!> Trying to reconnect');
                        const sock = await startsockets();
                        if (sock === true) {
                            console.log('<i> Reconnected successfully');
                        }
                        reconnecting = false;
                    }
                }, 6000);
            }
        } catch (error) {
            console.log(error);
            wm.notif('Error starting WebDesk Online Services.', 'You might need to update WebDesk.', async function () {
                await fs.del('/system/webdesk');
                await wd.reboot();
            }, 'Force Update');
        }

        const dropZone = document.body;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        dropZone.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;

            handleFiles(files);
        }

        async function handleFiles(files) {
            let filesArray = [...files];
            filesArray.forEach(file => {
                const reader = new FileReader();
                reader.onload = async function (e) {
                    const contents = e.target.result;
                    await fs.write(`/user/files/${file.name}`, contents);
                    app.files.init('/user/files/');
                };

                reader.readAsDataURL(file);
            });
        }
        wegood();
        await app.appmark.checkforup();
        if (navigator.onLine === false) {
            wm.notif("Offline", "You are offline, some features may not work.");
        }
    } catch (error) {
        console.log(error);
    }
}