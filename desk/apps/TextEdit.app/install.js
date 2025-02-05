app['textedit'] = {
    runs: true,
    name: 'TextEdit',
    init: async function (contents, path, readonly) {
        if (readonly !== true) {
            if (!path) {
                const path2 = await app.files.pick('new', 'Create new document/code');
                if (path2 !== false) {
                    app.textedit.init('', path2);
                }
                return;
            }
        }
        const win = tk.mbw('TextEdit', '500px', '340px');
        const tabs = tk.c('div', win.main, 'd');
        tabs.style.flex = "0 0 auto";
        tabs.appendChild(win.title);
        win.closebtn.style.marginLeft = "2px";
        const editdiv = tk.c('div', win.main, 'browsertab');
        editdiv.style.display = "block";
        editdiv.style.borderRadius = "0px";
        win.name.innerHTML = "";
        win.main.classList = "browsercont";
        const genit = gen(8);
        editdiv.id = genit;
        const editor = ace.edit(`${genit}`);
        editor.setOptions({
            fontFamily: "MonoS",
            fontSize: "var(--fz3)",
            wrap: true,
        });
        function ok() {
            if (ui.light === true) {
                editor.setTheme(null);
            } else {
                editor.setTheme("ace/theme/monokai");
            }
        }
        ok();
        const colorch = setInterval(() => {
            ok();
        }, 700);
        editor.setValue(contents, -1);
        async function save() {
            const newContents = editor.getValue();
            await fs.write(path, newContents);
            wm.snack('Saved');
        }
        if (readonly !== true) {
            tk.cb('b4 b6', 'Save', async function () {
                await save();
            }, win.name);
        } else {
            tk.cb('b4 b6', 'Save', async function () {
                const path = await app.files.pick('new', 'Save in new file');
                const newContents = editor.getValue();
                fs.write(path, newContents);
                wm.snack('Saved');
            }, win.name);
            editor.setReadOnly(true);
        }
        tk.cb('b4 b6', 'Menu', async function () {
            const menu = tk.c('div', document.body, 'cm');
            if (readonly !== true) {
                tk.p('Editing ' + path, 'bold', menu);
            } else {
                tk.p('Read-only text', 'bold', menu);
            }
            tk.cb('b1 b2', 'Select All', function () {
                editor.selectAll();
                ui.dest(menu, 120);
            }, menu);
            const btnc = tk.cb('b1 b2', 'Copy Text', function () {
                const menu2 = tk.c('div', document.body, 'rightclick');
                const pos = btnc.getBoundingClientRect();
                const thing = { clientX: pos.left, clientY: pos.top };
                ui.rightclick(menu2, thing, btnc, true);
                tk.cb('b3 b2', `Selected Text`, function () {
                    ui.copy(editor.getSelectedText());
                    ui.dest(menu); ui.dest(menu2);
                }, menu2);
                tk.cb('b3 b2', `Entire File`, function () {
                    ui.copy(editor.getValue());
                    ui.dest(menu); ui.dest(menu2);
                }, menu2);
            }, menu);
            tk.cb('b1 b2', 'Find Text', function () {
                editor.execCommand('find');
                ui.dest(menu, 120);
            }, menu);
            if (readonly !== true) {
                tk.cb('b1 b2', 'Replace', function () {
                    editor.execCommand('replace');
                    ui.dest(menu, 120);
                }, menu);
                tk.cb('b1', 'Undo', function () {
                    editor.execCommand('undo');
                }, menu);
            }
            tk.cb('b1', 'Close', function () {
                ui.dest(menu, 120);
            }, menu);
            if (readonly !== true) {
                tk.cb('b1', 'Redo', function () {
                    editor.execCommand('redo');
                }, menu);
            }
        }, win.name);
        function runc() {
            wd.exec(editor.getValue());
            tk.cb('b1', 'Close', function () {
                ui.dest(menu, 120);
            }, menu);
        }
        tk.cb('b4 b6', 'Run', async function () {
            runc();
        }, win.name);
        wd.win();
        if (readonly !== true) {
            editor.container.addEventListener('keydown', async function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();
                    await save();
                }
            });
            editor.container.addEventListener('keydown', async function (event) {
                if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
                    event.preventDefault();
                    await runc();
                }
            });
        }
        new ResizeObserver(() => {
            editor.resize();
        }).observe(win.win);
    }
};