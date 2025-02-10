app['backup'] = {
    runs: true,
    name: 'Migrate',
    init: async function () {
        const win = tk.mbw('Migrate', '300px', 'auto', true, undefined, undefined, '/system/lib/img/setup/quick.png');
        if (sys.guest === false) {
            tk.p(`Your apps will close, and unsaved data will be lost.`, undefined, win.main);
            tk.cb('b1', 'Migrate', async function () {
                await fs.write('/system/migval', 'down');
                wd.reboot();
            }, win.main);
        } else {
            tk.p(`You're in Guest mode. Reboot WebDesk and go through Setup to copy your data over.`, undefined, win.main);
            tk.cb('b1', 'Reboot', async function () {
                wd.reboot();
            }, win.main);
        }
    }
}