var globcall;
// This is a clusterfuck of bullshit that needs to be rewritten eventually
var ptp = {
    go: async function (id) {
        let retryCount = 0;
        let notify = false;

        async function attemptConnection() {
            sys.peer = new Peer(id, {
                config: {
                    'iceServers': [
                        { urls: 'stun:freeturn.net:3478' },
                        { urls: 'turn:freeturn.net:3478', username: 'free', credential: 'free' }
                    ]
                }
            });

            sys.peer.on('open', (peerId) => {
                ui.masschange('deskid', peerId);
                sys.deskid = peerId;
                console.log('<i> DeskID is online. ID: ' + sys.deskid);
                if (sys.echoid !== undefined) {
                    boot();
                }

                if (notify) {
                    wm.notif(`WebDesk Services`, `Your DeskID is back online.`, undefined, undefined, true);
                    retryCount = 0;
                }
                notify = false;
            });

            sys.peer.on('error', async (err) => {
                if (err.message.includes('Could not connect to')) {
                    return;
                }

                console.log(`<!> whoops: ${err}`);
                if (err.message.includes('Lost connection to server')) {
                    if (!notify) {
                        wm.notif('Connection/DeskID Error', `Your connection was interrupted. WebDesk is trying to reconnect your DeskID.`, undefined, undefined, true);
                        sys.deskid = "disabled";
                        ui.masschange('deskid', 'disabled');
                        app.ach.unlock('DeskID Issues', `Here's an achievement for your troubles.`);
                    }
                } else if (err.message.includes('is taken')) {
                    wm.notif('DeskID is taken', `Your DeskID is in use by someone else or another tab. You've been given a temporary DeskID until the next reboot.`);
                    app.ach.unlock('Identity Theft', "¯\\_(ツ)_/¯");
                    ptp.go(gen(7));
                    return;
                } else if (err.message.includes(`Error: Could not connect to peer ` + sys.echoid)) {
                    wm.wal(`<p class="bold">EchoDesk Connection Interrupted</p><p>The other WebDesk might have rebooted, or is encountering network issues.</p><p>Check your Internet on this side too.</p>`);
                }

                notify = true;
                if (retryCount < 5) {
                    console.log('<!> DeskID failed to register, trying again...');
                    retryCount++;
                    setTimeout(attemptConnection, 5000);
                } else {
                    console.log('<!> Maximum retry attempts reached. DeskID registration failed.');
                    const dialog = tk.c('div', document.body, 'cm');
                    tk.p(`Your DeskID couldn't be restored`, 'bold', dialog);
                    tk.p(`Select an option to continue`, undefined, dialog);
                    tk.cb('b1 b2', 'Keep trying', function () {
                        retryCount = 0;
                        attemptConnection();
                        ui.dest(dialog);
                    }, dialog);
                    tk.cb('b1 b2', 'Reboot WebDesk', function () {
                        wd.reboot();
                    }, dialog);
                    tk.cb('b1', 'Close', function () {
                        ui.dest(dialog);
                    }, dialog);
                }
            });

            sys.peer.on('connection', (dataConnection) => {
                dataConnection.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.type === 'request') {
                            const response = { response: sys.name, deskid: sys.deskid };
                            dataConnection.send(JSON.stringify(response));
                            dataConnection.close();
                        }
                    } catch (err) {
                        handleData(dataConnection, data);
                    }
                });

                dataConnection.on('error', (err) => {
                    console.error('Data connection error:', err);
                });

                dataConnection.on('close', () => {
                    console.log('<i> Data connection closed');
                });
            });

            sys.peer.on('call', (call) => {
                const showYourself = sys.peer.connect(call.peer);
                showYourself.on('open', () => {
                    showYourself.send(JSON.stringify({ type: 'request' }));
                });

                showYourself.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.response) {
                            wm.notif(`Call from ${parsedData.response}`, `Their DeskID is ${parsedData.deskid}`, function () {
                                navigator.mediaDevices.getUserMedia({ audio: true })
                                    .then((stream) => {
                                        call.answer(stream);
                                        call.on('stream', (remoteStream) => {
                                            app.webcall.answer(remoteStream, call, parsedData.response, stream);
                                        });
                                    })
                                    .catch((err) => {
                                        wm.notif('WebCall Error', 'Microphone access is denied, calling/answering might fail.');
                                        console.log(`<!> ${err}`);
                                    });
                            }, 'Answer');
                        }
                    } catch (err) {
                        console.error('Failed to parse data:', err);
                    }
                });

                showYourself.on('error', (err) => {
                    wm.notif('WebCall Error', err);
                });

                showYourself.on('close', () => {
                    console.log('Data connection closed');
                });
            });
        }

        attemptConnection();
    },
    getname: async function (id) {
        return new Promise(async (resolve, reject) => {
            let resolved = false;
            const check = setTimeout(function () {
                if (resolved === false) {
                    reject('Offline');
                }
            }, 3400);

            const showyourself = sys.peer.connect(id);
            showyourself.on('open', () => {
                showyourself.send(JSON.stringify({ type: 'request' }));
            });

            showyourself.on('data', (data) => {
                const parsedData = JSON.parse(data);
                resolved = true;
                clearTimeout(check);
                resolve(parsedData.response);
                showyourself.close();
            });

            showyourself.on('error', () => {
                clearTimeout(check);
                reject('Failed');
                showyourself.close();
            });
        });
    }
};

async function handleData(conn, data) {
    if (sys.dev === true) {
        console.log(data);
    }
    if (sys.webdrop === true) {
        if (data.name === "MigrationPackDeskFuck") {
            if (sys.setupd === false) {
                ui.sw('setupqs', 'setuprs'); restorefsold(data.file);
            }
        } else if (data.name === "MigrationFile") {
            if (sys.setupd === false) {
                if (data.filename === "/system/deskid") {
                    el.migstat.innerText = "Creating new DeskID";
                    wd.newid();
                    return;
                }
                ui.sw('quickstartwdsetup', 'quickstartwdgoing');
                el.migstat.innerText = "Copying: " + data.filename;
                await fs.write(data.filename, data.file);
            }
        } else if (data.name === "MigrationEnd") {
            if (sys.setupd === false) {
                setTimeout(function () {
                    ui.sw('quickstartwdgoing', 'setupdone');
                }, 600);
            }
        } else if (data.name === "EchoGive") {
            if (sys.setupd === "echo") {
                sys.model.innerText = data.act + ": " + data.path;
                console.log(data.act + ": " + data.path);
                if (data.act === "read") {
                    const fileData = await fs.read(data.path);
                    if (fileData === null) {
                        conn.send('TheresNoFile');
                    } else {
                        conn.send(fileData);
                    }
                } else if (data.act === "del") {
                    await fs.del(data.path);
                    conn.send(true);
                } else if (data.act === "write") {
                    await fs.write(data.path, data.file);
                    conn.send(true);
                } else if (data.act === "all") {
                    const ok = await fs.getall();
                    conn.send(ok);
                } else if (data.act === "ls") {
                    const ok = await fs.ls(data.path);
                    conn.send(ok);
                } else if (data.act === "date") {
                    const ok = await fs.date(data.path);
                    conn.send(ok);
                } else if (data.act === "delfold") {
                    const ok = await fs.delfold(data.path);
                    conn.send(true);
                }
            }
        } else if (data.name === "YesImAlive-WebKey") {
            wm.notif(`${data.uname}`, 'accepted your WebDrop.');
        } else if (data.name === "DesktoDeskMsg-WebKey") {
            wm.notif(data.file, 'WebDesk Services');
        } else if (data.name === "DeclineCall-WebKey") {
            fesw('caller3', 'caller1');
            snack('Your call was declined.');
        } else if (data.name === "Message-WebKey") {
            if (data.file === `End chat with ${sys.deskid}`) {
                ui.dest(el.webchat.win, 100);
                ui.dest(el.webchat.tbn, 100);
                el.webchat = undefined;
                el.currentid = undefined;
                wm.snack(`Other user ended the chat`, 10000);
                return;
            }
            if (el.currentid !== data.id) {
                wm.notif(`Message from ${data.uname}`, data.file, async function () {
                    if (el.currentid !== undefined) {
                        wm.notif(`Warning`, `Opening this message will delete your current chat.`, async function () {
                            ui.dest(el.webchat.win, 100);
                            ui.dest(el.webchat.tbn, 100);
                            el.webchat = undefined;
                            el.currentid = data.id;
                            custf(data.id, 'Message-WebKey', `End chat with ${data.id}`);
                            await app.webchat.init(`${data.id}`, `${data.file}`, `${data.uname}`);
                        });
                    } else {
                        el.currentid = data.id;
                        await app.webchat.init(`${data.id}`, `${data.file}`, `${data.uname}`);
                    }
                }, 'Open');
            } else {
                await app.webchat.init(`${data.id}`, `${data.file}`, `${data.uname}`);
            }
        } else if (data === "Name and FUCKING address please") {
            conn.send(sys.user);
        } else {
            wm.notif(`${data.uname} would like to share`, data.name, async function () {
                await fs.write(`/user/files/` + data.name, data.file);
                custf(data.id, 'YesImAlive-WebKey');
                app.files.init('/user/files/');
            }, 'Accept');
        }
    } else {
        custf(data.id, 'DesktoDeskMsg-WebKey', `${deskid} isn't accepting WebDrops right now.`);
    }
}

async function compressfs() {
    return new Promise(async (resolve, reject) => {
        try {
            const zip = new JSZip();
            const files = await fs.getall();
            const filePromises = files.map(async (file) => {
                const wait = await fs.read(file);
                zip.file(file, wait);
            });
            await Promise.all(filePromises);
            resolve(zip.generateAsync({ type: "blob" }));
        } catch (error) {
            reject(error);
        }
    });
}

async function migrationgo(deskid, el) {
    return new Promise(async (resolve, reject) => {
        try {
            const files = await fs.getall();
            const conn = sys.peer.connect(deskid);
            console.log('Part 1 complete');

            conn.on('open', async function () {
                try {
                    console.log('Part 2 complete');
                    const fileContents = await Promise.all(files.map(file => fs.read(file)));
                    fileContents.forEach((content, index) => {
                        if (el) {
                            el.innerText = 'Sending ' + files[index];
                        }
                        conn.send({
                            name: 'MigrationFile',
                            file: content,
                            filename: files[index],
                        });
                    });
                    conn.send({ name: 'MigrationEnd' });
                    resolve(true);
                } catch (fileReadError) {
                    wm.notif('File read error during migration', 'An issue occurred while reading files, reboot and try again.');
                    reject(fileReadError);
                }
            });

            conn.on('error', (err) => {
                wm.notif('Failed to connect', 'Reload this WebDesk, as well as the other WebDesk, and try again.');
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function restorefsold(zipBlob) {
    console.log('<i> Restore Stage 1: Prepare zip');
    try {
        ui.sw('quickstartwdsetup', 'quickstartwdgoing');
        const zip = await JSZip.loadAsync(zipBlob);
        const fileCount = Object.keys(zip.files).length;
        let filesDone = 0;
        console.log(`<i> Restore Stage 2: Open zip and extract ${fileCount} files to FS`);
        await Promise.all(Object.keys(zip.files).map(async filename => {
            console.log(`<i> Restoring file: ${filename}`);
            if (filename === "/user/info/name") {
                const file = zip.files[filename];
                const value = await file.async("string");
                fs.write('/user/info/name', value);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: Handling user data`);
            } else if (filename.includes('/system') || filename.includes('/user/info') || filename === '/user/oldhosts.json') {
                console.log(`<i> Skipped a file: ${filename}`);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: Skipped file: WebDesk specific`);
            } else {
                const file = zip.files[filename];
                const value = await file.async("string");
                fs.write(filename, value);
                filesDone++;
                ui.masschange('restpg', `Restoring ${filesDone}/${fileCount}: ${filename}`);
            }
        }));
        ui.sw('quickstartwdgoing', 'setupdone');
    } catch (error) {
        console.error('Error during restoration:', error);
    }
}

async function custf(id, fname2, fblob2) {
    return new Promise((resolve, reject) => {
        const dataToSend = {
            name: fname2,
            file: fblob2,
            uname: sys.name,
            id: sys.deskid
        };

        try {
            const conn = sys.peer.connect(id);

            conn.on('open', () => {
                conn.send(dataToSend);
                resolve(true);
            });

            conn.on('error', (err) => {
                console.error('Connection error:', err);
                wm.snack('An error occurred while sending your file.', 2500);
                reject(new Error('Connection error while sending the file'));
            });
        } catch (error) {
            console.error('Error while sending file:', error);
            wm.snack('An error occurred while sending your file.', 2500);
            reject(new Error('Error while sending the file'));
        }
    });
}

// Buggy, do NOT run unless you're testing
sys.deskidnotif = true;
async function refreshfriends() {
    if (sys.deskidnotif === true) {
        let data;
        let parsed;
        let ids = [];
        const notifiedDeskIds = {};

        data = await fs.read('/user/info/contactlist.json');
        parsed = JSON.parse(data);

        const refint = setInterval(async function () {
            if (sys.deskidnotif !== true) {
                clearInterval(refint);
                return;
            }
            data = await fs.read('/user/info/contactlist.json');
            parsed = JSON.parse(data);
        }, 20000);

        const int = setInterval(async function () {
            console.log('Int ran');
            if (sys.deskidnotif !== true) {
                clearInterval(int);
                return;
            } else if (sys.deskid === "disabled") {
                return;
            }
            for (const entry of parsed) {
                ids.push({ deskid: entry.deskid, deskid2: entry.deskid2 });

                await Promise.all(
                    ids.map(async ({ deskid, deskid2 }) => {
                        try {
                            const name = await ptp.getname(deskid);
                            wm.notif(`${name} is online`);
                            const currentStatus = 'online';
                            if (notifiedDeskIds[deskid] !== currentStatus) {
                                notifiedDeskIds[deskid] = currentStatus;
                            }
                        } catch (error) {
                            const currentStatus = 'offline';
                            if (notifiedDeskIds[deskid] !== currentStatus) {
                                notifiedDeskIds[deskid] = currentStatus;

                                if (deskid2 !== undefined) {
                                    await ptp.getname(deskid2)
                                        .then(name => {
                                            wm.notif(`${name} is online`);
                                        });
                                }
                            }
                        }
                    })
                );
            }
        }, 10000);
    }
}
