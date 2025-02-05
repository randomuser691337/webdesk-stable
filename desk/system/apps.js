var app = {
    echoclient: {
        runs: true,
        name: 'EchoDesk',
        init: async function () {
            const win = tk.mbw('EchoDesk', '300px', 'auto', true, undefined, undefined);
            if (sys.guest === true) {
                tk.p(`Enter the EchoDesk ID and hit either of the "Connect" buttons. <span class="bold">You're in Guest mode, so you can't enter EchoDesk mode.</span>`, undefined, win.main);
            } else {
                tk.p(`If you're connecting: Enter the EchoDesk ID and hit either of the "Connect" buttons.`, undefined, win.main);
                tk.p(`If you're the host: Hit "Enter EchoDesk Mode". Your apps will close, unsaved data will be lost.`, undefined, win.main);
                tk.cb('b1 b2', 'Enter EchoDesk mode', async function () {
                    await fs.write('/system/migval', 'echo');
                    wd.reboot();
                }, win.main);
            }
            tk.p(`Connect to other WebDesk`, undefined, win.main);
            const input = tk.c('input', win.main, 'i1');
            input.placeholder = "Enter EchoDesk ID";
            tk.cb('b1 b2', 'Connect in New Tab', async function () {
                window.open("./echodesk.html?deskid=" + input.value, '_blank');
            }, win.main);
            tk.cb('b1 b2', 'Connect Normally', async function () {
                app.browser.view("./echodesk.html?deskid=" + input.value);
            }, win.main);
        }
    },
    placeholder: {
        init: function () { wm.snack('I do nothing.'); } // Placeholder for container
    },
};