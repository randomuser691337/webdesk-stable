var wfs = new Worker('/wfs.js');
var fsloaded = false;
const pendingRequests = {};
let requestIdCounter = 0;

wfs.onmessage = function (event) {
    const { type, data, requestId } = event.data;

    if (requestId in pendingRequests) {
        const { resolve, reject } = pendingRequests[requestId];
        type === 'result' ? resolve(data) : reject(data);
        delete pendingRequests[requestId];
    } else {
        switch (type) {
            case 'db_ready':
                fsloaded = true;
                console.log(`<i> Calling boot()`);
                boot();
                break;
            case 'reboot':
                try {
                    wd.reboot();
                } catch {
                    window.location.reload();
                }
                break;
            case 'runaway':
                window.location.href = "https://meower.xyz?reason=You were sent here because you erased WebDesk. This is the developer's site, feel free to look around!";
                break;
            default:
                console.warn('<!> Unknown message type or requestId from wfs:', type);
        }
    }
};

var fs = {
    send(message, transferList) {
        wfs.postMessage(message, transferList);
    },
    askwfs(operation, params, opt) {
        const requestId = requestIdCounter++;
        return new Promise((resolve, reject) => {
            pendingRequests[requestId] = { resolve, reject };
            const message = { type: 'fs', operation, params, opt, requestId };
            const transferList = operation === 'write' && opt instanceof ArrayBuffer ? [opt] : undefined;
            this.send(message, transferList);
        });
    },
    date(path) {
        return this.askwfs('date', path);
    },
    read(path) {
        return this.askwfs('read', path);
    },
    write(path, data) {
        if (path.endsWith('/')) {
            wm.notif('Bad file write', `Remove "/" from the end of your path name.`);
            return Promise.reject('Invalid path');
        }
        return this.askwfs('write', path, data);
    },
    del(path) {
        return this.askwfs('delete', path);
    },
    async erase(path) {
        let menu;
        try {
            if (sys.webdeskbooted && ui) {
                const div = ui.darken();
                menu = tk.c('div', div, 'cm');
                tk.p(`Erasing`, 'bold', menu);
                tk.c('div', menu, 'line-wobble').style.marginTop = "5px";
                menu.style.width = "120px";
            }
        } catch (error) {
            console.log(error);
        }

        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));

        const go = await this.askwfs('erase', path);
        if (menu) {
            menu.innerHTML = go === "Hey wtf"
                ? `<p class="bold">Erase was blocked!</p><p>Try reloading and erasing again.</p>`
                : '';
        }
        if (go === "true") wd.reboot();
    },
    ls(path) {
        return this.askwfs('ls', path);
    },
    getall() {
        return this.askwfs('all');
    },
    delfold(path) {
        return this.askwfs('delfold', path);
    },
    async copyfold(oldplace, newplace) {
        const { items } = await this.ls(oldplace);
        const div = tk.c('div', document.body, 'cm');
        tk.p(`Copying ${oldplace} to ${newplace}`, undefined, div);
        const status = tk.p(`Starting...`, undefined, div);

        for (const path of items) {
            if (path.type === "folder") {
                await this.copyfold(path.path, `${newplace}${path.name}/`);
            } else {
                const fileContent = await this.read(path.path);
                await this.write(`${newplace}${path.name}`, fileContent);
                status.innerText = `Copying ${path.name}...`;
            }
        }

        status.innerText = `Copy completed.`;
        setTimeout(() => ui.dest(div, 0), 3000);
    },
    persist() {
        return this.askwfs('persist');
    },
    usedspace() {
        return this.askwfs('space');
    },
};

var set = {
    async set(key, value) {
        try {
            sys.config[key] = value;
            await fs.write("/user/info/config.json", JSON.stringify(sys.config));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    async del(key) {
        try {
            delete sys.config[key];
            await fs.write("/user/info/config.json", JSON.stringify(sys.config));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    async read(key) {
        return sys.config[key] ?? undefined;
    }
};
