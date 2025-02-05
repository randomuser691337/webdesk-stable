// Buggy mess, anyone willing to clean this mess
// up will be given free espresso and a kitten
app['webcomm'] = {
    runs: true,
    name: 'WebComm',
    init: async function (isid, id) {
        let win;
        if (isid === true) {
            win = tk.mbw('WebComm (Autofilled)', '320px', 'auto', true);
        } else {
            win = tk.mbw('WebComm', '320px', 'auto', true);
        }
        const inp = tk.c('input', win.main, 'i1');
        inp.placeholder = "Enter a DeskID";
        if (isid === true) {
            inp.value = id;
            wm.snack('Autofilled DeskID', 3000);
        }
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
                            }
                        });
                }, menu2);
            }
        }, win.main);
        const callbtn = tk.cb('b1', 'Voice Call', async function () {
            if (inp.value === sys.deskid) {
                wm.snack(`Type a DeskID that isn't yours.`);
                app.ach.unlock('So lonely...', 'So lonely, you tried calling yourself.');
            } else {
                await ptp.getname(inp.value)
                    .then(name => {
                        app.webcomm.webcall.init(inp.value, name);
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
                        }
                    });
            }
        }, win.main);
        const chatbtn = tk.cb('b1', 'Message', async function () {
            if (inp.value === sys.deskid) {
                wm.snack(`Type a DeskID that isn't yours.`);
                app.ach.unlock('So lonely...', 'So lonely, you tried messaging yourself.');
            } else {
                await ptp.getname(inp.value)
                    .then(name => {
                        app.webcomm.webchat.init(inp.value, undefined, name);
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
                        }
                    });
            }
        }, win.main);
        async function ok() {
            const data = await fs.read('/user/info/contactlist.json');
            skibidiv.innerHTML = "";
            tk.cb('b3 b2 webcomm dash', 'Manage or edit contacts', () => app.webcomm.contacts.init(), skibidiv);

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
    webchat: {
        runs: false,
        init: async function (deskid, chat, name) {
            if (el.webchat !== undefined) {
                wd.win(el.webchat.win, el.webchat.closebtn, el.webchat.minbtn, el.webchat.tbn);
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
                    const data = await fs.read('/user/info/contactlist.json');
                    if (data) {
                        ok = JSON.parse(data);
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
    }
};