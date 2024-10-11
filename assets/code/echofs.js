async function gosend(act, path, name, file) {
    return new Promise((resolve, reject) => {
        const dataToSend = {
            act, path, name, deskid: sys.deskid, file
        };

        try {
            const conn = sys.peer.connect(sys.echoid);
            conn.on('open', () => {
                conn.send(dataToSend);
                conn.on('data', (data) => {
                    if (data === "TheresNoFile") {
                        resolve(null);
                        conn.close();
                    } else {
                        resolve(data);
                        conn.close();
                    }
                });
            });

            conn.on('error', (err) => {
                console.error('Connection error:', err);
                resolve(null);
            });
        } catch (error) {
            console.error('Error while sending file:', error);
            resolve(null);
        }
    });
}

function echoerr() {
    wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
}

const fs = {
    read: async function (path) {
        let success = false;
        try {
            const result = await gosend('read', path, 'EchoGive');
            success = true;
            return result;
        } catch (error) {
            wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
            console.error('<!> ' + error);
        }

        setTimeout(() => {
            if (!success) {
                echoerr();
            }
        }, 9000);
    },
    write: async function (path, data) {
        let success = false;
        try {
            const result = await gosend('write', path, 'EchoGive', data);
            success = true;
            return result;
        } catch (error) {
            wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
            console.error('<!> ' + error);
        }

        setTimeout(() => {
            if (!success) {
                echoerr();
            }
        }, 9000);
    },
    del: async function (path) {
        let success = false;
        try {
            const result = await gosend('del', path, 'EchoGive');
            success = true;
            return result;
        } catch (error) {
            wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
            console.error('<!> ' + error);
        }

        setTimeout(() => {
            if (!success) {
                echoerr();
            }
        }, 9000);
    },
    erase: function (path) {
        wm.wal(`<p>Can't erase WebDesks when remotely connected via EchoDesk.</p>`);
    },
    ls: async function (path) {
        let success = false;
        try {
            const result = await gosend('ls', path, 'EchoGive');
            success = true;
            return result;
        } catch (error) {
            wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
            console.error('<!> ' + error);
        }

        setTimeout(() => {
            if (!success) {
                echoerr();
            }
        }, 9000);
    },
    getall: async function () {
        let success = false;
        try {
            const result = await gosend('all', path, 'EchoGive');
            success = true;
            return result;
        } catch (error) {
            wm.wal(`<p>EchoDesk is encountering issues.</p>`, () => reboot(), 'Reboot Now');
            console.error('<!> ' + error);
        }

        setTimeout(() => {
            if (!success) {
                echoerr();
            }
        }, 9000);
    },
    space: function () {
        return this.askwfs('space');
    },
};
