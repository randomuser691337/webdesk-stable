if (sys.dev === true) {
    app['devtools'] = {
        runs: true,
        name: 'DevTools',
        init: async function () {
            const win = tk.mbw('DevTools', '340px', 'auto', true, undefined, undefined);
            tk.cb('b1 b2 hide', 'Registry Editor', function () {

            }, win.main);
            tk.cb('b1 b2', 'Make & Copy App ID', () => ui.copy(gen(12)), win.main);
            tk.cb('b1 b2', 'Force Update on next reload', function () {
                fs.del('/system/webdesk');
                wm.snack('Done');
            }, win.main);
            tk.p('Development socket server', undefined, win.main);
            tk.p(`You can't communicate with WebDesks outside the dev socket, when enabled.`, undefined, win.main);
            const blurp = tk.p('', undefined, win.main);
            blurp.style = "display: flex; justify-content: space-between; padding: 0px; margin: 0px;";
            const blur1 = tk.cb('b1 b2', 'Disable (reboot)', function () {
                fs.del('/system/info/devsocket');
            }, blurp);
            blur1.style = "flex: 1 1; margin-right: 1px !important;";
            const blur2 = tk.cb('b1 b2', 'Enable (reboot)', async function () {
                fs.write('/system/info/devsocket', 'true');
            }, blurp);
            blur2.style = "flex: 1 1; margin-left: 1px !important;";
        }
    }
}