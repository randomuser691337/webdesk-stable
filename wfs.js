let db;
const request = indexedDB.open("WebDeskDB", 2);
const pin = undefined;
let lastAction = "Initializing";

function logTimeout(action) {
    lastAction = action;
    setTimeout(() => {
        console.warn(`<i> Operation "${lastAction}" is taking longer than expected.`);
    }, 4000);
}

request.onerror = function (event) {
    console.error('<!> Error opening database: ', event.target.error);
    self.postMessage({ type: 'error', data: event.target.error });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log('<i> Database opened successfully');
    self.postMessage({ type: 'db_ready' });
};

request.onupgradeneeded = function (event) {
    db = event.target.result;
    logTimeout("Upgrading database");
    if (!db.objectStoreNames.contains('main')) {
        const objectStore = db.createObjectStore('main', { keyPath: 'path' });
        console.log('Worker initialized DB for the first time');
    }
};

self.onmessage = async function (event) {
    const { type, operation, params, opt, requestId } = event.data;
    if (type === 'fs') {
        await idbop(operation, params, opt, requestId);
    }
};

async function idbop(operation, params, opt, requestId) {
    if ((typeof params === 'string' && params.includes('//'))) {
        self.postMessage({ type: 'result', data: null, requestId });
        console.error(`FS request contains //, which screws things up. Data has been returned as null. Params: ${params}`);
        return;
    } else if ((typeof params === 'string' && params.includes('/webdeskmetadata'))) {
        self.postMessage({ type: 'result', data: null, requestId });
        console.error(`<!> FS request contains /webdeskmetadata, which is used for date-keeping. Data has been returned as null. Params: ${params}`);
        return;
    }
    switch (operation) {
        case 'unlock':
            pin = params;
            break;
        case 'date':
            fs2.date(params)
                .then(data => {
                    self.postMessage({ type: 'result', data, requestId });
                })
                .catch(error => {
                    self.postMessage({ type: 'error', data: error, requestId });
                });
            break;
        case 'read':
            fs2.read(params)
                .then(data => {
                    self.postMessage({ type: 'result', data, requestId });
                })
                .catch(error => {
                    self.postMessage({ type: 'error', data: error, requestId });
                });
            break;
        case 'write':
            fs2.write(params, opt)
                .then(() => {
                    self.postMessage({ type: 'result', data: true, requestId });
                })
                .catch(error => {
                    self.postMessage({ type: 'error', data: error, requestId });
                });
            break;
        case 'delete':
            fs2.del(params)
                .then(() => {
                    self.postMessage({ type: 'result', data: true, requestId });
                })
                .catch(error => {
                    self.postMessage({ type: 'error', data: error, requestId });
                });
            break;
        case 'erase':
            try {
                await fs2.erase(params);
                self.postMessage({ type: 'result', data: true, requestId });
            } catch (error) {
                self.postMessage({ type: 'error', data: error.message || error, requestId });
            }
            break;

        case 'list':
            fs2.list(params);
            break;
        case 'persist':
            fs2.persist();
            break;
        case 'space':
            fs2.used().then(files => {
                self.postMessage({ type: 'result', data: files, requestId });
            }).catch(error => {
                console.error('Error fetching files:', error);
            });
            break;
        case 'all':
            fs2.all().then(files => {
                self.postMessage({ type: 'result', data: files, requestId });
            }).catch(error => {
                console.error('Error fetching files:', error);
            });
            break;
        case 'delfold':
            fs2.nukefold(params).then(result => {
                self.postMessage({ type: 'result', data: result, requestId });
            }).catch(error => {
                self.postMessage({ type: 'error', data: error, requestId });
            });
            break;
        case 'ls':
            fs2.folder(params).then(result => {
                self.postMessage({ type: 'result', data: result, requestId });
            }).catch(error => {
                self.postMessage({ type: 'error', data: error, requestId });
            });
            break;
        default:
            self.postMessage({ type: 'error', data: 'Unknown operation', requestId });
    }
}

var fs2 = {
    read: function (path) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            const request = objectStore.get(path);
            fs2.dwrite(path, false, false, true, false);
            request.onsuccess = function (event) {
                const item = event.target.result;
                if (item && item.data) {
                    try {
                        if (typeof item.data === 'string') {
                            resolve(item.data);
                        } else {
                            const reader = new FileReader();
                            reader.onload = function () {
                                resolve(reader.result);
                            };
                            reader.readAsText(item.data);
                        }
                    } catch (error) {
                        console.log(`<!> File isn't readable, returning raw contents: ` + error);
                        resolve(item.data);
                    }
                } else {
                    resolve(null);
                }
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    dwrite: function (path, created, edited, viewed, remove) {
        return new Promise((resolve, reject) => {
            if (path.includes('/webdeskmetadata')) {
                reject(`<!> Don't create a timestamp of a timestamp!`);
            }
            const transaction = db.transaction(['main'], 'readwrite');
            const objectStore = transaction.objectStore('main');
            let request1, request2, request3;

            if (remove === true) {
                request1 = objectStore.delete("/webdeskmetadata/created" + path);
                request2 = objectStore.delete("/webdeskmetadata/edit" + path);
                request3 = objectStore.delete("/webdeskmetadata/read" + path);
                request3.onsuccess = function () {
                    resolve();
                };
            }

            if (created === true) {
                const item = { path: "/webdeskmetadata/created" + path, data: Date.now() };
                request1 = objectStore.put(item);
            }

            if (edited === true) {
                const item = { path: "/webdeskmetadata/edit" + path, data: Date.now() };
                request2 = objectStore.put(item);
            }

            if (viewed === true) {
                const item = { path: "/webdeskmetadata/read" + path, data: Date.now() };
                request3 = objectStore.put(item);
            }

            request.onsuccess = function () {
                resolve();
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    write: async function (path, data) {
        if (path.includes('/webdeskmetadata')) {
            reject('Forbidden');
        }
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readwrite');
            const objectStore = transaction.objectStore('main');
            let content;

            if (typeof data === 'string') {
                content = data;
            } else if (typeof data === 'object') {
                content = JSON.stringify(data);
            } else {
                content = new Blob([data]);
            }

            const item = { path: path, data: content };
            const request = objectStore.put(item);
            const yeah = fs2.date(path);
            if (!yeah.created) {
                fs2.dwrite(path, true, true);
            } else {
                fs2.dwrite(path, false, true);
            }
            request.onsuccess = function () {
                resolve();
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    del: function (path) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readwrite');
            const objectStore = transaction.objectStore('main');
            const request = objectStore.delete(path);
            fs2.dwrite(path, false, false, false, true)
            request.onsuccess = function (event) {
                resolve();
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    date: function (path) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            const request = objectStore.get("/webdeskmetadata/created" + path);
            const request2 = objectStore.get("/webdeskmetadata/read" + path);
            const request3 = objectStore.get("/webdeskmetadata/edit" + path);
            let created = undefined;
            let read = undefined;
            let edit = undefined;
            let completed = 0;

            const check = () => {
                completed++;
                if (completed === 3) {
                    resolve({ created, read, edit });
                }
            };

            request.onsuccess = function (event) {
                const item = event.target.result;
                created = item && item.data ? item.data : null;
                check();
            };

            request2.onsuccess = function (event) {
                const item = event.target.result;
                read = item && item.data ? item.data : null;
                check();
            };

            request3.onsuccess = function (event) {
                const item = event.target.result;
                edit = item && item.data ? item.data : null;
                check();
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };

            request2.onerror = function (event) {
                reject(event.target.error);
            };

            request3.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    erase: async function (path) {
        return new Promise((resolve, reject) => {
            if (db) db.close();

            const deleteRequest = indexedDB.deleteDatabase("WebDeskDB");

            deleteRequest.onsuccess = function () {
                console.log("<!> WebDesk erased.");
                if (path === "reboot") {
                    self.postMessage({ type: 'reboot' });
                } else if (path === "runaway") {
                    self.postMessage({ type: 'runaway' });
                }
                resolve('true');
            };

            deleteRequest.onerror = function (event) {
                console.log("<!> Error erasing: ", event.target.error);
                reject(event.target.error);
            };

            deleteRequest.onblocked = function () {
                console.log("<!> Delete blocked");
                reject(new Error("Hey wtf"));
            };
        });
    },
    persist: function () {
        if ('storage' in navigator && 'persist' in navigator.storage) {
            navigator.storage.persist().then(function (persistent) {
                if (persistent) {
                    return true;
                } else {
                    return `Some weird issue occured.`;
                }
            }).catch(function (error) {
                console.log('<!> Error requesting persistence: ', error);
                return error;
            });
        } else {
            return "Persistence isn't supported in this browser.";
        }
    },
    folder: function (path) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            const items = new Map();

            objectStore.getAllKeys().onsuccess = function (event) {
                const keys = event.target.result;
                keys.forEach(key => {
                    if (key.startsWith(path)) {
                        const relativePath = key.substring(path.length);
                        const parts = relativePath.split('/');

                        if (parts.length > 1) {
                            if (!items.has(parts[0]) && path + parts[0] !== "/webdeskmetadata") {
                                items.set(parts[0], { path: path + parts[0] + '/', name: parts[0], type: 'folder' });
                            }
                        } else {
                            items.set(relativePath, { path: key, name: relativePath, type: 'file', folder: path });
                        }
                    }
                });
                resolve({ items: Array.from(items.values()) });
            };

            objectStore.getAllKeys().onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    nukefold: async function (path) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            objectStore.openCursor().onsuccess = async function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.key.startsWith(path)) {
                        const relativePath = cursor.key.substring(path.length);
                        const parts = relativePath.split('/');
                        if (parts.length > 1) {
                            fs2.nukefold(path + parts[0] + '/');
                        } else {
                            fs2.del(cursor.key);
                        }
                    }
                    cursor.continue();
                } else {
                    resolve(true);
                }
            };

            objectStore.openCursor().onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    all: function () {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            const fileContentsPromises = [];

            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const key = cursor.key;
                    const request = objectStore.get(key);
                    request.onsuccess = function (event) {
                        const item = event.target.result;
                        if (item && !item.path.includes('/webdeskmetadata')) {
                            fileContentsPromises.push(cursor.key);
                        }
                        request.onerror = function (event) {
                            reject(event.target.error);
                        };
                    }
                    cursor.continue();
                } else {
                    transaction.oncomplete = function () {
                        resolve(fileContentsPromises);
                    };
                }
            };

            objectStore.openCursor().onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    key: function () {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readwrite');
            const objectStore = transaction.objectStore('main');
            let content;
            let path = '/webdeskmetadata/system/key';

            if (typeof data === 'string') {
                length = 48;

                const array = new Uint32Array(Math.ceil(length / 4));
                window.crypto.getRandomValues(array);

                let result = '';
                for (let i = 0; i < array.length; i++) {
                    result += array[i].toString(16).padStart(8, '0');
                }

                content = result.slice(0, length);
            }

            const item = { path: path, data: content };
            const request = objectStore.put(item);
            const yeah = fs2.date(path);
            if (!yeah.created) {
                fs2.dwrite(path, true, true);
            } else {
                fs2.dwrite(path, false, true);
            }
            request.onsuccess = function () {
                console.log('<i> Generated private key');
                resolve();
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
    used: function () {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['main'], 'readonly');
            const objectStore = transaction.objectStore('main');
            let totalSize = 0;

            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const item = cursor.value;
                    if (item && item.data) {
                        if (typeof item.data === 'string') {
                            totalSize += item.data.length;
                        } else if (item.data instanceof Blob) {
                            totalSize += item.data.size;
                        } else if (typeof item.data === 'object') {
                            totalSize += JSON.stringify(item.data).length;
                        }
                    }
                    cursor.continue();
                } else {
                    navigator.storage.estimate().then(estimate => {
                        const availableSpace = estimate.quota - estimate.usage;
                        resolve({ used: totalSize, available: availableSpace });
                    }).catch(error => {
                        reject(error);
                    });
                }
            };

            objectStore.openCursor().onerror = function (event) {
                reject(event.target.error);
            };
        });
    },
};