app['files'] = {
    runs: true,
    name: 'Files',
    prohib: function (path) {
        if ((path.startsWith('/system/') || path.startsWith('/apps/') || path.startsWith('/user/info/')) && !path.startsWith('/system/lib/img/wallpapers/') && sys.dev === false) {
            return true;
        } else {
            return false;
        }
    },
    init: async function () {
        const win = tk.mbw(`Files`, '340px', '480px', true, undefined, undefined, '/apps/Files.app/Contents/icon.svg', true);
        const search = tk.c('input', win.main, 'i1');
        win.name.innerHTML = "";
        const breadcrumbs = tk.c('div', win.name);
        search.style.marginBottom = "5px";
        const items = tk.c('div', win.main);
        items.style.overflow = "auto";
        items.style.flexGrow = "1";
        items.style.borderRadius = "12px";
        items.style.padding = "6px";
        items.style.paddingTop = "0px";
        win.main.style.display = "flex";
        win.main.style.flexDirection = "column";
        win.main.style.height = "100%";
        win.main.style.padding = "8px";
        let items2;
        search.placeholder = "Search for a file...";
        search.addEventListener('input', function (event) {
            const searchText = search.value.toLowerCase();
            items2.forEach(item => {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(searchText)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        function clr() {
            items2.forEach(item => {
                item.style.display = 'block';
            });
            search.value = "";
        }
        search.addEventListener('blur', () => {
            clr();
        });
        search.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                clr();
            }
        });
        search.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const visible = Array.from(items2).filter(item => item.style.display !== 'none');
                if (visible.length === 1) {
                    visible[0].click();
                }
            }
        });
        var currentPath = undefined;
        let dragoverListener = null;
        let dropListener = null;
        async function navto(path) {
            items.innerHTML = "";
            breadcrumbs.innerHTML = "";
            let crumbs = path.split('/').filter(Boolean);
            let tempPath = '/';

            tk.cb('flist flists', 'Root', () => navto('/'), breadcrumbs);
            crumbs.forEach((crumb, index) => {
                tempPath += crumb + '/';
                tk.cb('flists', '/', undefined, breadcrumbs);
                tk.cb('flist flists', crumb, () => navto('/' + crumbs.slice(0, index + 1).join('/') + "/"), breadcrumbs);
            });

            currentPath = tempPath;
            const ok = tk.cb('b4', '+', function () {
                const menu = tk.c('div', document.body, 'rightclick');
                const pos = ok.getBoundingClientRect();
                const thing = { clientX: pos.left, clientY: pos.top };
                ui.rightclick(menu, thing, ok, true);
                const input = tk.c('input', menu, 'i1');
                input.placeholder = "Name your thing, hit a button";
                tk.cb('b3 b2', 'New text file', function () {
                    const prohibcheck = app.files.prohib(tempPath);
                    if (prohibcheck === true) {
                        wm.snack('Enable Developer Mode to make things here.');
                        return;
                    }
                    if (input.value) {
                        fs.write(tempPath + input.value, ' ');
                        navto(currentPath);
                        app.textedit.init('', tempPath + input.value);
                        ui.dest(menu, 0);
                    } else {
                        wm.snack('Enter a name for your file!');
                    }
                }, menu);
                tk.cb('b3 b2', 'New folder', function () {
                    if (input.value) {
                        fs.write(tempPath + input.value + "/.folder", ' ');
                        navto(tempPath + input.value + "/");
                        ui.dest(menu, 0);
                    } else {
                        wm.snack('Enter a name for your folder!');
                    }
                }, menu);
            }, breadcrumbs);
            ok.style.marginLeft = "3px";
            if (dragoverListener) items.removeEventListener('dragover', dragoverListener);
            if (dropListener) items.removeEventListener('drop', dropListener);

            dragoverListener = e => e.preventDefault();
            dropListener = async e => {
                e.preventDefault();
                el.dropped = true;
                const text = e.dataTransfer.getData('text/plain');
                if (app.files.prohib(text) === true) {
                    wm.snack('Enable Developer Mode to move system files.');
                    return;
                }
                const fileData = await fs.read(text);
                const relativePath = text.split('/').pop();
                await fs.del(text);
                await fs.write(currentPath + relativePath, fileData);
                setTimeout(() => navto(currentPath), 300);
            };

            items.addEventListener('dragover', dragoverListener);
            items.addEventListener('drop', dropListener);

            const contents = await fs.ls(path);
            for (const item of contents.items) {
                if (item.type === "folder") {
                    let folder;
                    console.log(item);
                    if (item.path.endsWith('.app/')) {
                        folder = tk.cb('flist width left', "📦 " + item.name, function () {
                            const menu = tk.c('div', document.body, 'cm');
                            if (sys.dev === true) {
                                if (item.path.startsWith('/apps/')) {
                                    tk.p(item.name, 'bold', menu);
                                    tk.cb('b1 b2', 'View contents', async function () {
                                        await navto(item.path);
                                        ui.dest(menu);
                                    }, menu);
                                    tk.cb('b1 b2', 'Delete app', async function () {
                                        await fs.delfold(item.path);
                                        ui.dest(menu);
                                        ui.slidehide(folder, 100);
                                    }, menu);
                                    tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                } else {
                                    tk.p(`This is a WebDesk app, but it's not in the /Apps/ folder.`, 'bold', menu);
                                    tk.cb('b1 b2', 'View contents', async function () {
                                        await navto(item.path);
                                        ui.dest(menu);
                                    }, menu);
                                    tk.cb('b1 b2', 'Delete app', async function () {
                                        await fs.delfold(item.path);
                                        ui.dest(menu);
                                        ui.slidehide(folder, 100);
                                    }, menu);
                                    tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                }
                            } else {
                                if (!item.path.startsWith('/apps/')) {
                                    tk.p(item.name, 'bold', menu);
                                    tk.cb('b1 b2', 'View contents', async function () {
                                        await navto(item.path);
                                        ui.dest(menu);
                                    }, menu);
                                    tk.cb('b1 b2', 'Delete app', async function () {
                                        await fs.delfold(item.path);
                                        ui.dest(menu);
                                        ui.slidehide(folder, 100);
                                    }, menu);
                                    tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                } else {
                                    tk.p(`Enable Developer Mode to manage this app, or go to Settings -> Manage apps`, 'bold', menu);
                                    tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                                }
                            }
                        }, items);
                    } else {
                        folder = tk.cb('flist width left', "📁 " + item.name, () => navto(item.path), items);
                    }

                    let isLongPress = false;
                    let timer;

                    function openmenu() {
                        if (app.files.prohib(item.path) === true) {
                            wm.snack('Enable Developer Mode to modify this folder.', 6000);
                            return;
                        }

                        const menu = tk.c('div', document.body, 'cm');
                        const p = tk.ps(item.path, 'bold', menu);
                        p.style.marginBottom = "7px";
                        if (item.path.startsWith('/system/') || item.path.startsWith('/user/info/') || item.path.startsWith('/apps/')) {
                            tk.p('Important folder, modifying it could cause damage.', 'warn', menu);
                        }
                        tk.cb('b1 b2', 'Delete folder', () => {
                            fs.delfold(item.path);
                            ui.slidehide(folder, 100);
                            ui.dest(folder);
                            ui.dest(menu);
                        }, menu);
                        tk.cb('b1', 'Close', () => ui.dest(menu), menu);
                    }

                    folder.addEventListener('touchstart', e => {
                        e.preventDefault();
                        isLongPress = false;
                        timer = setTimeout(() => {
                            isLongPress = true;
                            openmenu();
                        }, 400);
                    });
                    folder.addEventListener('touchend', () => {
                        clearTimeout(timer);
                        if (!isLongPress) {
                            navto(item.path);
                        }
                    });
                    folder.addEventListener('touchmove', () => clearTimeout(timer));
                    folder.addEventListener('touchcancel', () => clearTimeout(timer));
                    folder.addEventListener('contextmenu', e => {
                        e.preventDefault();
                        openmenu();
                    });
                } else {
                    if (item.name === "" || item.name.startsWith('.', 1)) {
                        return;
                    }

                    const fileItem = tk.cb('flist width left', "📄 " + item.name, undefined, items);

                    if (item.name === ".folder") {
                        fileItem.style.display = "none";
                    }

                    fileItem.addEventListener('dragstart', e => {
                        e.dataTransfer.setData('text/plain', item.path);
                    });

                    fileItem.addEventListener('dragend', e => {
                        setTimeout(function () {
                            console.log(el.dropped)
                            if (el.dropped === true) {
                                ui.slidehide(fileItem, 100);
                                ui.dest(fileItem);
                            }
                        }, 100);
                    });
                    fileItem.draggable = true;
                    let isLongPress = false;
                    let timer;

                    async function openmenu(event) {
                        const menu2 = tk.c('div', document.body, 'rightclick');
                        const date = await fs.date(item.path);
                        tk.p(`<span class="bold">Created</span> ${wd.timec(date.created)}`, undefined, menu2);
                        tk.p(`<span class="bold">Edited</span> ${wd.timec(date.edit)}`, undefined, menu2);
                        tk.p(`<span class="bold">Read</span> ${wd.timec(date.read)}`, undefined, menu2);
                        if (!event) {
                            ui.rightclick(menu2, undefined, fileItem);
                        } else {
                            ui.rightclick(menu2, event, fileItem);
                        }
                    }

                    async function openmenuv2() {
                        try {
                            if (app.files.prohib(item.path) === true) {
                                wm.snack('Enable Developer Mode to modify system files.', 6000);
                                return;
                            }

                            const skibidi = tk.c('div', document.body, 'cm');
                            skibidi.innerText = `Loading ${item.name}, this might take a bit`;
                            const filecontent = await fs.read(item.path);
                            const menu = tk.c('div', document.body, 'cm');
                            const p = tk.ps(item.path, 'bold', menu);

                            if (item.path.startsWith('/system/') || item.path.startsWith('/user/info/') || item.path.startsWith('/apps/')) {
                                tk.p('Important file, modifying it could cause damage.', 'warn', menu);
                            }

                            if (item.path.startsWith('/user/info/name')) {
                                tk.p('Deleting this file will erase your data on next restart.', 'warn', menu);
                            }

                            let thing;

                            try {
                                if (!filecontent.startsWith('data:video')) {
                                    if (filecontent.startsWith('data:image')) {
                                        thing = tk.img(filecontent, 'embed', menu, false, true);
                                        (await thing).img.style.marginBottom = "4px";
                                    } else if (item.name.endsWith('.svg')) {
                                        thing = tk.img(item.path, 'embed', menu, false, false);
                                        (await thing).img.style.marginBottom = "4px";
                                    } else if (item.name.endsWith('.zip')) {
                                    } else if (item.name.endsWith('.mp3')) {
                                        const audio = tk.c('audio', menu, 'hide');
                                        thing = tk.c('div', menu);
                                        thing.style.resize = "none";
                                        const progressBar = tk.c('input', thing);
                                        progressBar.type = "range";
                                        progressBar.min = 0;
                                        progressBar.max = 100;
                                        progressBar.value = 0;
                                        progressBar.style.width = "90% !important";

                                        const playPauseBtn = tk.cb('b4', 'Play', function () {
                                            if (audio.paused) {
                                                audio.play();
                                                playPauseBtn.textContent = "Pause";
                                            } else {
                                                audio.pause();
                                                playPauseBtn.textContent = "Play";
                                            }
                                        }, thing);

                                        audio.addEventListener("timeupdate", function () {
                                            progressBar.value = (audio.currentTime / audio.duration) * 100;
                                        });

                                        progressBar.addEventListener("input", function () {
                                            audio.currentTime = (progressBar.value / 100) * audio.duration;
                                        });

                                        let correct;
                                        if (item.name.endsWith('.wav')) {
                                            correct = filecontent.replace(/^data:application\/octet-stream/, 'data:audio/wav');
                                            audio.src = correct;
                                        } else if (item.name.endsWith('.mp3')) {
                                            correct = filecontent.replace(/^data:application\/octet-stream/, 'data:audio/mpeg');
                                            audio.src = correct;
                                        } else {
                                            console.log(`<!> Audio file isn't wav or mp3, giving up`);
                                            audio.remove();
                                            thing.innerText = "Music file is corrupted or not supported";
                                        }
                                        correct = undefined;
                                        thing.style.marginBottom = "4px";
                                    } else {
                                        thing = tk.c('div', menu, 'embed resizeoff');
                                        const genit = gen(8);
                                        thing.id = genit;
                                        const editor = ace.edit(`${genit}`);
                                        editor.setOptions({
                                            fontFamily: "MonoS",
                                            fontSize: "9px",
                                            wrap: true,
                                        });
                                        if (ui.light !== true) editor.setTheme("ace/theme/monokai");
                                        thing.style.marginBottom = "4px";
                                        thing.style.height = "130px";
                                        editor.resize();
                                        editor.setValue(filecontent, -1);
                                        editor.setReadOnly(true);
                                    }
                                }
                            } catch (error) {
                                console.log('<!> ' + error);
                                const ok = tk.p('Failed to load preview.', 'warn', menu);
                                ok.style.marginBottom = "7px";
                                if (thing) {
                                    thing.img.remove();
                                    thing.remove();
                                }
                            }

                            const btnmenu = tk.c('div', menu, 'brick-layout');
                            btnmenu.style.marginBottom = "4px";

                            tk.cb('b3', 'Open', async function () {
                                app.files.openfile(filecontent, item);
                                ui.dest(menu);
                            }, btnmenu);
                            tk.cb('b3', 'Open with', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const btnmenu2 = tk.c('div', menu2, 'brick-layout');
                                btnmenu.style.marginBottom = "4px";
                                tk.cb('b3', 'Iris Media Viewer', function () {
                                    app.imgview.init(filecontent, item.path);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Music', function () {
                                    app.music.init(item.path, item.name);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Text Editor', function () {
                                    app.textedit.init(filecontent, item.path);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Weather Archive', function () {
                                    app.wetter.init(true, filecontent);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'Wallpaper', function () {
                                    wd.setwall(filecontent, undefined, true);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                tk.cb('b3', 'console.log', function () {
                                    console.log(filecontent);
                                    ui.dest(menu2);
                                }, btnmenu2);
                                if (sys.dev === true) {
                                    tk.cb('b3', 'Update Package', async function () {
                                        const dark = ui.darken();
                                        const menu = tk.c('div', dark, 'cm');
                                        tk.img('/desk/system/lib/img/icons/warn.svg', 'icon', menu);
                                        tk.p('Install this WebDesk?', 'bold', menu);
                                        tk.p(`This will overwrite WebDesk with it's own files, which could install viruses.`, undefined, menu);
                                        tk.p(`Make sure you have a backup. WebDesk updates will overwrite this version.`, undefined, menu);
                                        tk.cb('b1 nodontdoit', 'Install', async function () {
                                            await fs.write('/system/custom', 'true');
                                            const blob = await (await fetch(filecontent)).blob();
                                            const zip = await JSZip.loadAsync(blob);
                                            const files = zip.files;
                                            for (const filename in files) {
                                                const file = files[filename];
                                                if (!file.dir) {
                                                    if (filename.endsWith('.png') || filename.endsWith('.wav') || filename.endsWith('.woff2')) {
                                                        const binaryContents = await file.async('blob');
                                                        const reader = new FileReader();
                                                        reader.onload = async function (e) {
                                                            const base64Data = e.target.result;
                                                            await fs.write(`/${filename}`, base64Data);
                                                        };
                                                        reader.readAsDataURL(binaryContents);
                                                    } else {
                                                        const contents = await file.async('string');
                                                        await fs.write("/" + filename, contents);
                                                    }
                                                }
                                            }
                                            wd.reboot();
                                        }, menu);
                                        tk.cb('b1', 'Cancel', () => ui.dest(dark), menu);
                                    }, btnmenu2);
                                }
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2).style.marginTop = "4px";
                            }, btnmenu);
                            tk.cb('b3', 'Download', () => {
                                wd.download(filecontent, `WebDesk File ${gen(4)}`);
                                ui.dest(menu);
                            }, btnmenu);
                            tk.cb('b3', 'WebDrop', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const input = tk.c('input', menu2, 'i1');
                                input.placeholder = "Enter DeskID";
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                                tk.cb('b1', 'WebDrop', async function () {
                                    menu2.innerHTML = `<p class="bold">Sending file</p><p>Depending on the size, this might take a bit</p>`;
                                    tk.cb('b1', 'Close (No status updates)', () => ui.dest(menu2), menu2);
                                    await custf(input.value, item.name, filecontent).then(success => {
                                        menu2.innerHTML = success
                                            ? `<p class="bold">File sent</p><p>The other person can accept or deny</p>`
                                            : `<p class="bold">An error occurred</p><p>Make sure the ID is correct</p>`;
                                        tk.cb('b1', 'Close', () => ui.dest(menu2), menu2);
                                    });
                                }, menu2);
                            }, btnmenu);
                            tk.cb('b3', 'Rename/Move', function () {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                const input = tk.c('input', menu2, 'i1');
                                input.placeholder = "Path for copying/moving";
                                input.value = item.path;
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                                tk.cb('b1', 'Copy', () => {
                                    fs.write(input.value, filecontent);
                                    navto(path);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Rename/Move', () => {
                                    fs.write(input.value, filecontent);
                                    fs.del(item.path);
                                    navto(path);
                                    ui.dest(menu2);
                                }, menu2);
                            }, btnmenu);
                            tk.cb('b3', 'Delete file', () => {
                                ui.dest(menu);
                                const menu2 = tk.c('div', document.body, 'cm');
                                tk.ps('Are you sure you want to delete ' + item.path + '?', undefined, menu2);
                                tk.ps(`This cannot be undone!`, undefined, menu2);
                                tk.cb('b1', 'Delete file', () => {
                                    fs.del(item.path);
                                    ui.slidehide(fileItem, 100);
                                    ui.dest(fileItem);
                                    ui.dest(menu2);
                                }, menu2);
                                tk.cb('b1', 'Cancel', () => ui.dest(menu2), menu2);
                            }, btnmenu);
                            tk.cb('b1', 'Cancel', () => ui.dest(menu), menu);
                            ui.dest(skibidi);
                        } catch (error) {
                            console.log('<!> ' + error);
                            const fileItem = tk.cb('flist width left warn', "File (One or more failed to load)" + item.name, async function () {
                                wm.snack('Trying to load in TextEdit...');
                                const cont = await fs.read(item.path);
                                app.textedit.init(cont, item.path);
                            });
                        }
                    }

                    let startX, startY, isScrolling;

                    // I'll deal with it later
                    fileItem.addEventListener('touchstart', e => {
                        e.preventDefault();
                        isLongPress = false;
                        isScrolling = false;
                        startX = e.touches[0].clientX;
                        startY = e.touches[0].clientY;

                        timer = setTimeout(() => {
                            if (!isScrolling) {
                                isLongPress = true;
                                openmenuv2();
                            }
                        }, 400);
                    });

                    fileItem.addEventListener('touchmove', e => {
                        const moveX = e.touches[0].clientX;
                        const moveY = e.touches[0].clientY;

                        if (Math.abs(moveX - startX) > 10 || Math.abs(moveY - startY) > 10) {
                            isScrolling = true;
                            clearTimeout(timer);
                        }
                    });

                    fileItem.addEventListener('touchend', () => {
                        clearTimeout(timer);
                        if (!isLongPress && !isScrolling) {
                            const event = new MouseEvent('dblclick', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            });
                            fileItem.dispatchEvent(event);
                        }
                    });

                    // add double click event listener to element
                    fileItem.addEventListener('dblclick', async function () {
                        if (app.files.prohib(item.path) === true) {
                            wm.snack('Enable Developer Mode to modify this file.', 3000);
                            return;
                        }

                        const filecontent = await fs.read(item.path);
                        app.files.openfile(filecontent, item);
                        ui.dest(menu);
                    });

                    fileItem.addEventListener('touchcancel', () => clearTimeout(timer));

                    if (sys.mob === false) {
                        fileItem.addEventListener('contextmenu', e => {
                            e.preventDefault();
                            openmenuv2(e);
                        });
                    }
                }
            };
            items2 = items.querySelectorAll('.flist');
            if (items2.length === 1 &&
                items2[0].style.display === 'none' &&
                items2[0].innerText.trim() === 'File: .folder'
            ) {
                tk.p('No files here yet', 'bold', items);
                tk.p('Drag files over from another Files window, or hit the + in the titlebar', undefined, items);
            }
        }

        navto('/user/files/');
    },
    pick: function (type, text) {
        return new Promise(async (resolve, reject) => {
            let win = {};
            win.win = tk.c('div', document.body, 'cm');
            tk.p(text, 'bold', win.win);
            const breadcrumbs = tk.c('div', win.win);
            win.main = tk.c('div', win.win, 'embed nest');
            win.win.style.background = "var(--ui3)";
            win.win.style.width = "300px";
            win.main.style.height = "300px";
            win.main.style.overflow = "auto";
            win.main.style.marginBottom = "5px";
            win.main.style.marginTop = "5px";
            const items = tk.c('div', win.main);
            let selectedPath = undefined;

            async function navto(path) {
                items.innerHTML = "";
                breadcrumbs.innerHTML = "";
                let crumbs = path.split('/').filter(Boolean);
                let currentPath = '/';

                tk.cb('flist', 'Root', () => navto('/'), breadcrumbs);

                crumbs.forEach((crumb, index) => {
                    currentPath += crumb + '/';
                    tk.cb('flists', '/', undefined, breadcrumbs);
                    tk.cb('flist', crumb, () => navto('/' + crumbs.slice(0, index + 1).join('/') + "/"), breadcrumbs);
                });

                selectedPath = currentPath;
                const thing = await fs.ls(path);
                thing.items.forEach(function (thing) {
                    if (thing.type === "folder") {
                        const target = tk.cb('flist width left', "📁 " + thing.name, () => navto(thing.path), items);
                    } else {
                        if (thing.name == "") {
                            return;
                        }
                        const target = tk.cb('flist width left', "📄 " + thing.name, async function () {
                            if (type !== "new") {
                                const menu = tk.c('div', document.body, 'cm');
                                tk.p(thing.path, 'bold', menu);
                                tk.cb('b1', 'Cancel', function () {
                                    ui.dest(menu);
                                }, menu);
                                tk.cb('b1', 'Choose', function () {
                                    ui.dest(menu); ui.dest(win.win);
                                    if (app.files.prohib(thing.path) === true) {
                                        if (sys.dev === false) {
                                            wm.snack(`Enable Developer Mode to make or edit files here.`);
                                            return;
                                        }
                                    }
                                    resolve(thing.path);
                                }, menu);
                            }
                        }, items);
                    }
                });
            }
            let inp;
            if (type === "new") {
                inp = tk.c('input', win.win, 'i1');
                inp.placeholder = "File name here";
            }

            tk.cb('b1', 'Close', function () {
                ui.dest(win.win);
                reject(false);
            }, win.win);

            if (type === "new") {
                tk.cb('b1', 'Random name', function () {
                    inp.value = gen(8);
                }, win.win);
                tk.cb('b1', 'New file', function () {
                    if (inp.value === "") {
                        wm.snack('Enter a filename.');
                    } else {
                        if (app.files.prohib(selectedPath) === true) {
                            if (sys.dev === false) {
                                wm.snack(`Enable Developer Mode to make or edit files here.`);
                                return;
                            }
                        }
                        resolve(selectedPath + inp.value);
                        ui.dest(win.win);
                    }
                }, win.win);
            }

            navto('/user/files/');
        });
    },
    openfile: function (filecontent, item) {
        if (filecontent.startsWith('data:app') || filecontent.startsWith('data:image')) {
            app.imgview.init(filecontent);
        } else if (filecontent.startsWith('data:') && (item.path.endsWith('.mp3') || item.path.endsWith('.wav'))) {
            app.music.init(item.path, item.name);
        } else if (filecontent.startsWith('data:')) {
            app.imgview.init(filecontent, item.path, item.name);
        } else {
            app.textedit.init(filecontent, item.path);
        }
    }
};