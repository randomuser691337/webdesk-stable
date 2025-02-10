app['about'] = {
    runs: true,
    name: 'About',
    init: async function () {
        const win = tk.mbw('About', undefined, 'auto', true, undefined, undefined, '/system/lib/img/noround.png');
        tk.css('/apps/About.app/abt.css');
        const main = tk.c('div', win.main, 'abtcont');
        const side = tk.c('div', main, 'abtlogo');
        const info = tk.c('div', main, 'abtinfo');
        const logo = tk.img('/system/lib/img/favicon.png', 'abtimg', side);
        // i spent too much time coding this, all for a dumb joke ;-;
        (async function () {
            const logoel = await logo;
            let timeout;
            logoel.img.addEventListener('mouseover', function () {
                timeout = setTimeout(async function () {
                    logoel.edit.load('/system/lib/img/icons/HYPERPIGMENTATION.png');
                }, 1000);
                logoel.img.addEventListener('mouseout', function onMouseOut() {
                    clearTimeout(timeout);
                    logoel.img.removeEventListener('mouseout', onMouseOut);
                });
            });
        })();
        win.main.style.padding = "0px";
        tk.cb('b4 b2', 'Changes', () => wd.hawktuah(true), side);
        tk.cb('b4 b2', 'Status', async function () {
            const win = tk.mbw('Status', '300px', undefined, true);
            try {
                const response = await fetch(`https://weather.meower.xyz/status`);
                const info = await response.json();
                if (info.status) {
                    tk.ps('Weather: ' + info.status, undefined, win.main);
                } else {
                    tk.ps('Weather: Offline', undefined, win.main);
                }
            } catch (error) {
                tk.ps('Weather: Offline', undefined, win.main);
            }
            try {
                const response = await fetch(`https://appmarket.meower.xyz/status`);
                const info = await response.json();
                if (info.status) {
                    tk.ps('App Market: ' + info.status, undefined, win.main);
                } else {
                    tk.ps('App Market: Offline', undefined, win.main);
                }
            } catch (error) {
                tk.ps('App Market: Offline', undefined, win.main);
            }
        }, side);
        tk.cb('b4 b2', 'Discord', () => window.open('https://discord.gg/5Y6ycJS4gu', '_blank'), side);
        tk.cb('b4 b2', 'Creds', function () {
            const ok = tk.c('div', document.body, 'cm');
            ok.innerHTML = `<p class="bold">Credits</p>
            <p>All the libraries or materials that helped create WebDesk.</p>
            <p><a href="https://peerjs.com/" target="blank">PeerJS: DeskID/online services</a></p>
            <p><a href="https://davidshimjs.github.io/qrcodejs/" target="blank">qrcode.js: WebDesk QR codes</a></p>
            <p><a href="https://jquery.com/" target="blank">jQuery: WebDesk's UI</a></p>
            <p><a href="https://fonts.google.com/" target="blank">Google Fonts: Fonts</a></p>
            <p><a href="https://ace.c9.io/" target="blank">Ace: TextEdit's engine</a></p>
            <p><a href="https://fengyuanchen.github.io/cropperjs/" target="blank">cropper.js: Cropping tool</a></p>
            <p><a href="https://jscolor.com/" target="blank">jscolor: Color picker</a></p>
            <p><a href="https://ace.c9.io/" target="blank">jszip: ZIP file handling</a></p>
            <p><a href="https://lucide.dev/" target="blank">Lucide: Most icons</a></p>`;
            tk.cb('b1', 'Close', function () {
                ui.dest(ok, 200);
            }, ok);
        }, side);
        const setupon = await fs.read('/system/info/setuptime');
        const ogver = await fs.read('/system/info/setupver');
        const color = await fs.read('/user/info/color');
        tk.p(`WebDesk ${abt.ver}`, 'h2', info);
        tk.p(`<span class="bold">Updated</span> ${abt.lastmod}`, undefined, info);
        if (setupon) {
            const fucker = wd.timed(Number(setupon));
            const seo = tk.p(`<span class="bold">Set up on</span> `, undefined, info);
            const seos = tk.c('span', seo);
            seos.innerText = fucker;
        }
        tk.p(`<span class="bold">DeskID</span> ${sys.deskid}`, undefined, info);
        if (ogver) {
            const ogv = tk.p(`<span class="bold">Set up with </span> `, undefined, info);
            const ogvs = tk.c('span', ogv);
            ogvs.innerText = ogver;
        }
        if (sys.dev) {
            tk.p(`<span class="bold">Dev Mode</span> ` + sys.dev, undefined, info);
        }
        if (color) {
            const col = tk.p(`<span class="bold">Color</span> `, undefined, info);
            const cols = tk.c('span', col);
            cols.innerText = color;
        }
        win.win.style.resize = "none";
    }
}