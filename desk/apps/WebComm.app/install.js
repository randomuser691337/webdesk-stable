// Buggy mess, anyone willing to clean this mess
// up will be given free espresso and a kitten
app['webcomm'] = {
    runs: true,
    name: 'WebComm',
    init: async function (isid, id) {
        if (wd.checkperms() === false) return;
        let win;
        if (isid === true) {
            win = tk.mbw('WebComm (Autofilled)', '320px', 'auto', true);
        } else {
            win = tk.mbw('WebComm', '320px', 'auto', true);
        }
        win.name.innerHTML = ""
        tk.cb('b4', 'Privacy', function () {
            const menu = tk.c('div', document.body, 'cm');
            tk.img('/system/lib/img/icons/update.svg', 'setupi', menu);
            tk.ps('Data & Privacy', 'bold', menu);
            tk.ps('With WebDesk, it never happened.', undefined, menu);
            tk.ps(`WebDesk's server keeps no record of what you do.`, undefined, menu);
            tk.ps('All data from WebDrop, WebCall, and WebChat is erased after use.', undefined, menu);
            tk.ps('Contacts are auto-created, with no server involvement.', undefined, menu);
            tk.cb('b1', 'Got it', () => ui.dest(menu), menu);
        }, win.name);
        const inp = tk.c('input', win.main, 'i1');
        inp.placeholder = "Enter a username";
        if (isid === true) {
            inp.value = id;
            wm.snack('Autofilled username', 3000);
        }
        const skibidiv = tk.c('div', win.main);
        let extraid = undefined;
        const dropbtn = tk.cb('b1', 'WebDrop', async function () {
            if (inp.value === sys.deskid) {
                wm.snack(`Type a username that isn't yours.`);
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
                            }
                        });
                }, menu2);
            }
        }, win.main);
        const callbtn = tk.cb('b1', 'Voice Call', async function () {
            if (inp.value === sys.name) {
                wm.snack(`Type a username that isn't yours.`);
                app.ach.unlock('So lonely...', 'So lonely, you tried calling yourself.');
            } else {
                sys.callid = await gens(32);
                sys.socket.emit("call", { token: webid.token, username: inp.value, deskid: sys.deskid, id: `${sys.callid}` });
                random["call" + sys.callid] = tk.mbw('WebCall', '260px', 'auto', true, undefined, undefined);
                random["call" + sys.callid].win.click();
                const msg = tk.p(`Waiting for answer`, undefined, random["call" + sys.callid].main);
                tk.cb('b1 nodontdoit', 'End', function () {
                    sys.callid = undefined;
                    random["call" + sys.callid].closebtn.click();
                }, random["call" + sys.callid].main);
                setTimeout(function () {
                    if (msg) {
                        msg.innerText = inp.value + " didn't pick up";
                    }
                }, 15000);
            }
        }, win.main);
        const chatbtn = tk.cb('b1', 'Message', async function () {
            if (inp.value === sys.name) {
                wm.snack(`Type a username that isn't yours.`);
                app.ach.unlock('So lonely...', 'So lonely, you tried messaging yourself.');
            } else {
                await app.webcomm.webchat.init(inp.value, '', 'open');
            }
        }, win.main);
        async function ok() {
            const data = await fs.read('/user/info/contacts.json');
            skibidiv.innerHTML = "";
            tk.cb('b3 b2 webcomm dash', 'Manage or edit contacts', () => app.webcomm.contacts.init(), skibidiv);

            if (data) {
                const parsed = JSON.parse(data);
                const buttons = [];

                for (const entry of parsed) {
                    let btn;
                    if (entry.name) {
                        btn = tk.cb('b3 b2 webcomm', entry.name, function () {
                            inp.value = entry.name;
                        }, skibidiv);
                    }

                    buttons.push({ btn, name: entry.name, });
                }

                await Promise.all(
                    buttons.map(({ btn, name }) => {
                        return new Promise((resolve) => {
                            sys.socket.emit('status', { token: webid.token, username: name }, (response) => {
                                if (response.status === 'online') {
                                    btn.innerText = ui.filter(`${name} - Online`);
                                } else if (name !== undefined) {
                                    sys.socket.emit('status', { token: webid.token, username: name }, (response2) => {
                                        if (response2.status === 'online') {
                                            btn.innerText = ui.filter(`${name} - Online`);
                                        } else {
                                            btn.innerText = ui.filter(`${name} - Offline`);
                                        }
                                        resolve();
                                    });
                                } else {
                                    btn.innerText = ui.filter(`${name} - Offline`);
                                    resolve();
                                }
                            });
                        });
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
    webcall: {
        runs: false,
        init: async function (name, deskid, id) {
            const win = tk.mbw('WebCall', '260px', 'auto', true, undefined, undefined);
            const callStatus = tk.p(`Connecting...`, undefined, win.main);
            let oncall = false;
            sys.callid = id;
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
                    app.webcomm.webcall.answer(remoteStream, call, name, stream);
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
    webchat: {
        runs: false,
        init: async function (name, message, multi) {
            if (random[name]) {
                if (multi === true) {
                    message.forEach((message) => {
                        const msg = tk.c('div', random[name].chatting, 'msg othersent');
                        msg.style.marginBottom = "3px";
                        msg.innerText = ui.filter(message);
                    });
                } else {
                    const msg = tk.c('div', random[name].chatting, 'msg othersent');
                    msg.style.marginBottom = "3px";
                    msg.innerText = ui.filter(message);
                }
                random[name].chatting.scrollTop = random[name].chatting.scrollHeight;
                wd.win(random[name].win);
            } else {
                if (wd.checkperms() === false) {
                    wm.notif(name, `sent you a message, but your account is limited. View anyways?`, async function () {

                    }, 'Show message');
                    return;
                };

                if (random[name + "notif"]) {
                    ui.dest(random[name + "notif"]);
                    if (random[name + "count"]) {
                        random[name + "count"]++;
                    } else {
                        random[name + "count"] = 1;
                    }
                }

                function go() {
                    delete random[name + "count"];
                    random[name] = tk.mbw('WebChat', '300px', 'auto', true);
                    random[name].messaging = tk.c('div', random[name].main);
                    random[name].chatting = tk.c('div', random[name].messaging, 'embed nest message-container');
                    random[name].chatting.style.overflow = "auto";
                    random[name].chatting.style.height = "350px";
                    tk.ps(`Talking with ${name}`, 'smtxt', random[name].chatting);
                    if (sys.filter === true) {
                        tk.ps(`Some filters can detect things YOU send, as they monitor your typing.`, 'smtxt', random[name].chatting);
                    }

                    random[name].containchatdiv = tk.c('div', random[name].messaging);
                    random[name].containchatdiv.style.display = "flex";

                    random[name].input = tk.c('input', random[name].containchatdiv, 'i1 tnav');
                    random[name].input.placeholder = "Message " + name;

                    function send() {
                        const msg = random[name].input.value;
                        if (msg) {
                            sys.socket.emit("message", { token: webid.token, username: name, contents: msg });
                            const div = tk.c('div', random[name].chatting, 'msg mesent');
                            div.innerText = ui.filter(msg);
                            div.style.marginBottom = "3px";
                            random[name].input.value = '';
                            random[name].chatting.scrollTop = random[name].chatting.scrollHeight;
                        }
                    }

                    random[name].containchatdiv.style.marginTop = "5px";

                    tk.cb('b1 title resist', 'Send', () => send(), random[name].containchatdiv);

                    ui.key(random[name].input, "Enter", () => send());

                    random[name].closebtn.addEventListener('mousedown', function () {
                        random[name] = undefined;
                    });

                    app.webcomm.add(name);
                    app.webcomm.webchat.init(name, message, multi);
                }

                if (multi === "open") {
                    go();
                } else {
                    if (random[name + "count"]) {
                        const notif = wm.notif(name + ` (${random[name + "count"]})`, message, async function () {
                            go();
                        }, 'Open');
                        random[name + "notif"] = notif.div;
                    } else {
                        const notif = wm.notif(name, message, async function () {
                            go();
                        }, 'Open');
                        random[name + "notif"] = notif.div;
                    }
                }
            }
        }
    },
    add: async function (name) {
        try {
            if (!name) {
                console.log('<!> No name provided');
                return;
            }
            const data = await fs.read('/user/info/contacts.json');
            if (data) {
                const newen = { name: name, time: Date.now() };
                const jsondata = JSON.parse(data);
                const check = jsondata.some(entry => entry.name === newen.name);
                if (check !== true) {
                    jsondata.push(newen);
                    fs.write('/user/info/contacts.json', jsondata);
                }
            } else {
                await fs.write('/user/info/contacts.json', [{ name: name, time: Date.now() }]);
            }
        } catch (error) {
            console.log(`<!> Couldn't add contact: `, error);
            return null;
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
                app.webcomm.contacts.init();
            }
            async function load() {
                try {
                    const data = await fs.read('/user/info/contacts.json');
                    if (data) {
                        ok = JSON.parse(data);
                        ok.forEach((entry) => {
                            const notif = tk.c('div', win.main, 'notif2');
                            tk.ps(entry.name, 'bold', notif);
                            if (entry.deskid2) {
                                tk.ps(`${entry.name}`, undefined, notif);
                            }
                            tk.cb('b4', 'Remove', async function () {
                                const update = ok.filter(item => item.time !== entry.time);
                                const updated = JSON.stringify(update);
                                await fs.write('/user/info/contacts.json', updated);
                                ui.slidehide(notif);
                                ui.dest(notif);
                                ok = update;
                            }, notif);
                            tk.cb('b4', 'Edit', async function () {
                                const update = ok.find(item => item.time === entry.time);
                                const menu = tk.c('div', document.body, 'cm');
                                tk.p(`Edit Contact`, 'bold', menu);
                                const name = tk.c('input', menu, 'i1');
                                name.placeholder = "User's username";
                                if (update && update.name) name.value = update.name;
                                tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                tk.cb('b1', 'Save', async function () {
                                    const updatedData = ok.filter(item => item.time !== entry.time);
                                    const newEntry = {
                                        name: name.value,
                                        time: Date.now()
                                    };
                                    updatedData.push(newEntry);
                                    await fs.write('/user/info/contacts.json', updatedData);
                                    ui.dest(menu);
                                    reload();
                                }, menu);
                            }, notif);
                        });
                    } else {
                        await fs.write('/user/info/contacts.json', '[]');
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
                name.placeholder = "Username";
                tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                tk.cb('b1', 'Save', async function () {
                    const newEntry = {
                        name: name.value,
                        time: Date.now()
                    };
                    const update = ok.find(item => item.name === newEntry.name);
                    console.log(update);
                    if (update !== undefined) {
                        wm.snack('Already saved that person');
                    } else {
                        if (deskid2.value) newEntry.deskid2 = deskid2.value;
                        ok.push(newEntry);
                        await fs.write('/user/info/contacts.json', ok);
                        ui.dest(menu);
                        reload();
                    }
                }, menu);
            }, win.main);
            await load();
        },
    }
};