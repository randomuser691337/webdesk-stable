var globcall;
// This is a clusterfuck of bullshit that needs to be rewritten eventually
var ptp = {
    go: async function (id) {
        let retryc = 0;
        var fucker = false;

        async function attemptConnection() {
            sys.peer = new Peer(id, [{ debug: 3 }]);

            sys.peer.on('open', (peerId) => {
                ui.masschange('deskid', peerId);
                sys.deskid = peerId;
                console.log('<i> DeskID is online. ID: ' + sys.deskid);
                if (sys.echoid !== undefined) {
                    boot();
                }
                if (fucker === true) {
                    wm.notif(`WebDesk Services`, `Your DeskID is back online.`);
                    fucker = false;
                    retryc = 0;
                }
            });

            sys.peer.on('error', async (err) => {
                console.log(`<!> whoops: ${err}`);
                if (fucker === false) {
                    if (err.message.includes('Lost connection to server')) {
                        wm.notif('Connection Error', `Your connection was interrupted, so your DeskID is broken. WebDesk is trying to restore the connection.`);
                    } else if (err.message.includes('is taken')) {
                        wm.notif('DeskID is taken', `Your DeskID is in use by someone else or another tab. You've been given a temporary DeskID until next reboot.`);
                    }
                }
                if (err.message.includes('is taken')) {
                    ptp.go(gen(8));
                    return;
                } else if (err.message.includes(`Error: Could not connect to peer ` + sys.echoid)) {
                    wm.wal(`<p class="bold">EchoDesk Connection Interrupted</p><p>The other WebDesk might have rebooted, or is encountering network issues.</p><p>Check your Internet on this side too.</p>`);
                }
                fucker = true;
                if (retryc < 5) {
                    console.log('<!> DeskID failed to register, trying again...');
                    retryc++;
                    setTimeout(attemptConnection, 10000);
                } else if (retryc >= 5) {
                    console.log('<!> Maximum retry attempts reached. DeskID registration failed.');
                    wm.notif(`Your DeskID is disabled`, `You will not be able to send messages to other`, () => wd.reboot());
                }
            });

            sys.peer.on('connection', (dataConnection) => {
                dataConnection.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.type === 'request') {
                            const response = {
                                response: sys.name
                            };

                            dataConnection.send(JSON.stringify(response));
                        }
                    } catch (err) {
                        console.log('<!> offload time: ' + err);
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

                const showyourself = sys.peer.connect(call.peer);
                showyourself.on('open', () => {
                    showyourself.send(JSON.stringify({ type: 'request' }));
                });

                showyourself.on('data', (data) => {
                    try {
                        const parsedData = JSON.parse(data);

                        if (parsedData.response) {
                            wm.notif(`Call from ${parsedData.response}`, 'Answer?', function () {
                                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                                    call.answer(stream);
                                    call.on('stream', (remoteStream) => {
                                        app.webcall.answer(remoteStream, call, parsedData.response);
                                    });
                                }).catch((err) => {
                                    wm.notif('WebCall Error', 'Microphone access is denied, calling/answering might fail.');
                                    console.log(`<!> ${err}`);
                                });
                            });
                        }
                    } catch (err) {
                        console.error('Failed to parse data:', err);
                    }
                });

                showyourself.on('error', (err) => {
                    wm.notif('WebCall Error', err);
                });

                showyourself.on('close', () => {
                    console.log('Data connection closed');
                });
            });
        }

        attemptConnection();
    },
}

async function handleData(conn, data) {
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
                fs.write(data.filename, data.file);
                el.migstat.innerText = "Restored: " + data.filename;
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
                }
            }
        } else if (data.name === "YesImAlive-WebKey") {
            wm.notif(`${data.uname} accepted your WebDrop.`, 'WebDesk Services');
        } else if (data.name === "DesktoDeskMsg-WebKey") {
            wm.notif(data.file, 'WebDesk Services');
        } else if (data.name === "DeclineCall-WebKey") {
            fesw('caller3', 'caller1');
            snack('Your call was declined.');
        } else if (data === "Name and FUCKING address please") {
            conn.send(sys.user);
        } else {
            recb = data.file;
            recn = data.name;
            play('./assets/other/webdrop.ogg');
            wal(`<p class="h3">WebDrop</p><p><span class="med dropn">what</span> would like to share <span class="med dropf">what</span></p>`, `acceptdrop();custf('${data.id}', 'YesImAlive-WebKey');`, 'Accept', './assets/img/apps/webdrop.svg');
            masschange('dropn', data.uname);
            masschange('dropf', data.name);
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

function sends(name, file) {
    fname = name;
    fblob = file;
    opapp('sendf');
    masschange('fname', name);
}

function sendf(id) {
    try {
        custf(id, fname, fblob);
        snack('File has been sent.', 2500);
        play('./assets/other/woosh.ogg');
    } catch (error) {
        console.log('<!> Error while sending file:', error);
        snack('An error occurred while sending your file.', 2500);
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