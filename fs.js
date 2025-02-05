var wfs = new Worker('/wfs.js');

wfs.onmessage = function (event) {
    const { type, data, requestId } = event.data;
    if (pendingRequests[requestId]) {
        if (type === 'result') {
            pendingRequests[requestId].resolve(data);
        } else if (type === 'error') {
            pendingRequests[requestId].reject(data);
        }
        delete pendingRequests[requestId];
    } else if (type === 'db_ready') {
        boot();
    } else if (type === "reboot") {
        try {
            wd.reboot();
        } catch (error) {
            window.location.reload();
        }
    } else if (type === "runaway") {
        window.location.src = "https://meower.xyz?reason=You were sent here because you erased WebDesk. This is the developer's site, feel free to look around!";
    } else {
        console.warn('<!> Unknown message type or requestId from wfs:', type);
    }
};

const pendingRequests = {};
let requestIdCounter = 0;

var fs = {
    send: function (message, transferList) {
        wfs.postMessage(message, transferList);
    },
    askwfs: function (operation, params, opt) {
        const requestId = requestIdCounter++;
        return new Promise((resolve, reject) => {
            pendingRequests[requestId] = { resolve, reject };
            if (operation === 'write' && opt instanceof ArrayBuffer) {
                fs.send({ type: 'fs', operation, params, opt, requestId }, [p2]);
            } else {
                fs.send({ type: 'fs', operation, params, opt, requestId });
            }
        });
    },
    date: function (path) {
        return this.askwfs('date', path);
    },
    read: function (path) {
        return this.askwfs('read', path);
    },
    write: function (path, data) {
        return this.askwfs('write', path, data);
    },
    del: function (path) {
        return this.askwfs('delete', path);
    },
    erase: function (path) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
                if (registration.active) {
                    registration.active.postMessage({ type: 'stop' });
                }
            }
        });
        return this.askwfs('erase', path);
    },
    ls: function (path) {
        return this.askwfs('ls', path);
    },
    getall: function () {
        return this.askwfs('all');
    },
    delfold: function (path) {
        return this.askwfs('delfold', path);
    },
    copyfold: async function (oldplace, newplace) {
        const ok = await fs.ls(oldplace);
        for (const path of ok.path) { 
            console.log(path);
        }
    },
    persist: function () {
        return this.askwfs('persist');
    },
};