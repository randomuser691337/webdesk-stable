app['ach'] = {
    runs: true,
    name: 'Achievements',
    init: async function () {
        async function load() {
            try {
                const data = await fs.read('/user/info/achieve.json');
                if (data) {
                    const parsed = JSON.parse(data);
                    let yeah = 0;
                    parsed.forEach((entry) => {
                        const notif = tk.c('div', win.main, 'notif2');
                        tk.p(entry.name, 'bold', notif);
                        tk.p(entry.cont, undefined, notif);
                        tk.p(`Unlocked on ${wd.timec(entry.time)}`, undefined, notif);
                        yeah++
                    });
                    const elements = document.getElementsByClassName("achcount");
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].innerText = yeah;
                    }
                } else {
                    await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                    await load();
                }
            } catch (error) {
                console.log('<!> Achievements shat itself: ', error);
                return null;
            }
        }

        const win = tk.mbw('Achievements', '300px', 'auto', true, undefined, undefined, '/apps/Achievements.app/Contents/icon.svg');
        if (sys.mobui === false) {
            win.win.style.maxHeight = "60%";
        }
        tk.p(`WebDesk Achievements`, 'h2', win.main);
        tk.p(`Remember: These are jokes and don't actually do anything`, undefined, win.main);
        tk.p(`Unlocked <span class="bold achcount"></span> achievements`, undefined, win.main);
        await load();
    },
    unlock: async function (name, content) {
        try {
            const data = await fs.read('/user/info/achieve.json');
            if (data) {
                const newen = { name: name, cont: content, time: Date.now() };
                const jsondata = JSON.parse(data);
                const check = jsondata.some(entry => entry.name === newen.name);
                const check2 = jsondata.some(entry => entry.cont === newen.cont);
                if (check !== true && check2 !== true) {
                    wm.notif(`Achieved: ` + name, content, () => app.ach.init());
                    jsondata.push(newen);
                    fs.write('/user/info/achieve.json', jsondata);
                }
            } else {
                await fs.write('/user/info/achieve.json', [{ name: "First Achievement", cont: "Unlock a WebDesk achievement", time: Date.now() }]);
                await app.ach.unlock(name, content);
            }
        } catch (error) {
            console.log('<!> Achievements shat itself: ', error);
            return null;
        }
    }
}