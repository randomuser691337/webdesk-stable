var app = {
    echoclient: {
        runs: false,
        name: 'File Transfer',
        init: async function () {
            const win = tk.mbw('', '300px', 'auto', true, undefined, undefined);
            tk.p(`File Transfer lets you copy files from another WebDesk.`, undefined, win.main);
            tk.p(`If you're the host: Hit "Enter Transfer Mode". Your apps will close, unsaved data will be lost.`, undefined, win.main);
            tk.cb('b1 b2', 'Enter EchoDesk mode', async function () {
                await fs.write('/system/migval', 'echo');
                wd.reboot();
            }, win.main);
            tk.p(`Connect to other WebDesk`, undefined, win.main);
            const input = tk.c('input', win.main, 'i1');
            input.placeholder = "Enter EchoDesk ID";
            tk.cb('b1 b2', 'Connect Normally', async function () {
                app.browser.view("./echodesk.html?deskid=" + input.value);
            }, win.main);
        }
    },
    placeholder: {
        init: function () { wm.snack('I do nothing.'); } // Placeholder for container
    },
};