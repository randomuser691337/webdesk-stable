// No clue what lunatic still uses the WebDesk
// Browser, but you do you I guess
app['browser'] = {
    runs: true,
    name: 'Browser',
    init: async function (path2) {
        tk.css('/system/lib/layout1.css');
        const win = tk.mbw('Browser', '80vw', '80vh', undefined, undefined, undefined, '/apps/Browser.app/Contents/icon.svg');
        const tabs = tk.c('div', win.main, 'tabbar d');
        const btnnest = tk.c('div', tabs, 'tnav');
        const okiedokie = tk.c('div', tabs, 'browsertitle');
        const searchbtns = tk.c('div', okiedokie, 'tnav');
        btnnest.appendChild(win.winbtns);
        win.closebtn.style.marginLeft = "2px";
        win.winbtns.style.marginBottom = "3px";
        win.title.remove();
        let thing = [];
        let currentTab = tk.c('div', win.main, 'hide');
        let currentBtn = tk.c('div', win.main, 'hide');
        let currentName = tk.c('div', win.main, 'hide');
        win.main.classList = "browsercont";
        const searchInput = tk.c('input', okiedokie, 'i1 b6');

        function addtab(url) {
            const tab = tk.c('embed', win.main, 'browsertab browserREALtab');
            tab.src = url || "https://meower.xyz";
            ui.sw2(currentTab, tab, 100);
            currentTab = tab;
            let lastUrl = "";
            const urls = [];
            thing = [...urls];

            const tabBtn = tk.cb('b4 browserpad', '', function () {
                ui.sw2(currentTab, tab, 100);
                currentTab = tab;
                currentBtn = tabTitle;
                thing = [...urls];
            }, win.winbtns);
            const tabTitle = tk.c('span', tabBtn);
            tabTitle.innerText = url || "meower.xyz";
            currentName = tabTitle;
            currentBtn = tabTitle;

            const closeTabBtn = tk.cb('browserclosetab', 'x', function () {
                ui.dest(tabBtn);
                ui.dest(currentTab);
            }, tabBtn);
            setInterval(function () {
                const currentUrl = currentTab.src;
                if (currentUrl !== lastUrl) {
                    lastUrl = currentUrl;
                    urls.push(currentUrl);
                    thing = [...urls];
                    searchInput.innerText = currentUrl;
                    currentName.innerText = currentUrl;
                }
            }, 200);
        }

        tk.cb('b3', '+', () => addtab(), searchbtns);
        tk.cb('b3', '⟳', function () {
            currentTab.src = currentTab.src;
        }, searchbtns);
        tk.cb('b3', '<', function () {
            if (thing.length > 1) {
                const currentIndex = thing.indexOf(currentTab.src);
                if (currentIndex > 0) {
                    const li = thing[currentIndex - 1];
                    searchInput.value = li;
                    currentTab.src = li;
                    currentName.innerText = li;
                }
            }
        }, searchbtns);
        tk.cb('b3', '>', function () {
            if (thing.length > 1) {
                const currentIndex = thing.indexOf(currentTab.src);
                if (currentIndex < thing.length - 1) {
                    const li = thing[currentIndex + 1];
                    searchInput.value = li;
                    currentTab.src = li;
                    currentName.innerText = li;
                }
            }
        }, searchbtns);
        searchInput.placeholder = "Enter URL";

        function load() {
            const url = searchInput.value.includes('https://') ? searchInput.value : "https://" + searchInput.value;
            currentTab.src = url;
            currentBtn.innerText = searchInput.value;
            if (['porn', 'e621', 'rule34', 'r34', 'xvideos', 'c.ai', 'webtoon'].some(term => searchInput.value.includes(term))) {
                app.ach.unlock('The Gooner', `We won't judge — we promise.`);
            } else if (searchInput.value.includes(window.origin)) {
                app.ach.unlock('Webception!', `Just know that the other WebDesk will probably end up erased.`);
            }
        }

        const whocares = tk.cb('b3', '…', function () {
            const menu = tk.c('div', document.body, 'rightclick');
            const pos = whocares.getBoundingClientRect();
            const thing2 = { clientX: pos.left, clientY: pos.top };
            ui.rightclick(menu, thing2, whocares, true);
            tk.cb('b3 b2', 'Install As Web App', async function () {
                const id = gen(12);
                const path = '/apps/' + id + '.app/';
                const filt = currentTab.src.replace("https://", "").replace("http://", "");
                const name = ui.truncater(filt, 18);
                const newen = { name: name, ver: 1.0, installedon: Date.now(), dev: 'Browser', appid: id, system: false, lastpath: path };
                await fs.write(`${path}install.js`, `app['${id}'] = {
                runs: true,
                name: '${name}',
                init: function () {
                app.browser.view('${currentTab.src}', '${name}');
                }
            }`);
                await fs.write(`${path}manifest.json`, newen);
                wm.notif(name + ' was installed');
                app.browser.view(currentTab.src);
                ui.dest(menu, 0);
            }, menu);
            tk.cb('b3 b2', 'Go!', function () {
                load(); ui.dest(menu, 0);
            }, menu);
        }, okiedokie);

        const listener = async function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                load();
                document.removeEventListener('keydown', listener);
            }
        };

        document.addEventListener('keydown', listener);

        setTimeout(function () {
            addtab(typeof path2 === "string" ? path2 : undefined);
        }, 250);
        wd.win();
        const annoy = await fs.read('/apps/Browser.app/Contents/annoyread');
        if (!annoy) {
            const div = tk.c('div', document.body, 'cm');
            tk.img('/apps/Browser.app/Contents/icon.svg', 'setupi', div, false);
            tk.p(`Welcome to Browser!`, 'bold', div);
            tk.p(`Browser can't unblock. To unblock, search for "rammerhead links" on Google, and look. The button below will try to pass filters.`, undefined, div);
            tk.cb('b1', 'Search Google', function () {
                window.open('https://google.com/search?q=rmmerhad lnks', '_blank')
            }, div); tk.cb('b1', 'Got it', () => ui.dest(div), div);
            await fs.write('/apps/Browser.app/Contents/annoyread', 't');
        }
    },
    view: async function (path2, title, background) {
        tk.css('/system/lib/layout1.css');
        if (title === undefined) {
            title = "Embedder";
        } else {
            title = title;
        }
        const win = tk.mbw(title, '640px', '440px');
        const tab = tk.c('embed', win.main, 'browsertab browserREALtab');
        win.main.classList = "browsercont";
        win.name.innerHTML = "";
        if (background === false) {
            tab.style.background = "rgba(0, 0, 0, 0)";
        }
        tk.cb('b3', '⟳', function () {
            tab.src = tab.src;
        }, win.name);
        setTimeout(function () {
            if (path2) {
                tab.src = path2;
            } else {
                tab.src = "https://meower.xyz";
            }
            ui.show(tab, 0);
        }, 250);
        wd.win();
        return tab;
    }
}