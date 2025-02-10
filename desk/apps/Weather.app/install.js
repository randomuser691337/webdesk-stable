app['wetter'] = {
    runs: true,
    name: 'Weather',
    init: async function (archive, file) {
        const win = tk.mbw('Weather', 'auto', 'auto', true, undefined, undefined, '/apps/Weather.app/icon.svg');
        win.win.style.minWidth = "210px;"
        /* const canvas = tk.c('canvas', document.body);
        canvases.snow(canvas);
        canvas.style.width = "100%";
        canvas.style.display = "block";
        win.closebtn.addEventListener('mousedown', function () {
            ui.dest(canvas);
        }); */
        if (sys.mobui === false) {
            win.win.style.maxWidth = "330px";
        }
        win.main.innerHTML = "Loading...";
        async function refresh() {
            try {
                let response;
                let info;
                let unitsym = sys.unitsym;
                if (archive !== true) {
                    response = await fetch(`https://weather.meower.xyz/json?city=${sys.city}&units=${sys.unit}`);
                    info = await response.json();
                } else {
                    info = await JSON.parse(file);
                }
                win.main.innerHTML = "";
                const skibidi = tk.c('div', win.main);
                if (archive !== true) {
                    tk.p(`${sys.city}`, 'med', skibidi);
                    win.name.innerHTML = "";
                    tk.cb('b3', 'Archive data', async function () {
                        const the = await app.files.pick('new', 'Save weather archive file... (JSON)');
                        const silly = info;
                        silly.timestamp = Date.now();
                        await fs.write(the + ".json", silly);
                        wm.snack('Saved weather to ' + the + ".json");
                    }, win.name);
                } else {
                    if (archive !== true) {
                        tk.p(`${sys.city}`, 'med', skibidi);
                    } else {
                        if (info.sys.country !== "US") {
                            unitsym = "°C";
                        } else {
                            unitsym = "°F";
                        }
                        tk.p(`${info.name}, ${info.sys.country}`, 'med', skibidi);
                    }
                    tk.ps('Archived: ' + wd.timec(info.timestamp), undefined, skibidi);
                }
                const userl = tk.c('div', skibidi, 'list flexthing');
                const tnav = tk.c('div', userl, 'tnav');
                const title = tk.c('div', userl, 'title');
                tnav.style.marginLeft = "6px";
                userl.style.marginBottom = "6px";
                tnav.innerText = `${Math.ceil(info.main.temp)}${unitsym}, ${info.weather[0].description}`;
                const img = tk.img(`https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`, 'weatheri', title, undefined, true);
                title.style.maxHeight = "40px";
                tk.p(`Humidity ${archive = archive === true ? "was" : "is"} ${info.main.humidity}%, and it ${archive = archive === true ? "felt" : "feels"} like ${Math.ceil(info.main.feels_like)}${sys.unitsym}.`, undefined, skibidi);
                tk.p(`Data from <a href="https://openweathermap.org", target="_blank">OpenWeatherMap.</a>`, 'smtxt', skibidi);
                tk.cb('b1', 'Settings', () => app.settings.locset.init(), skibidi);
                tk.cb('b1', 'Refresh', function () {
                    refresh(); wm.snack('Refreshed');
                }, skibidi);
                if (sys.dev === true) {
                    tk.cb('b1', 'JSON', async function () {
                        const ok = JSON.stringify(info);
                        app.textedit.init(ok, undefined, true);
                    }, skibidi);
                }
            } catch (error) {
                console.log(error);
                win.main.innerHTML = "<p>Error loading weather.</p>";
                tk.cb('b1', 'Close', () => wm.close(win.win), win.main);
                tk.cb('b1', 'Retry', () => refresh(), win.main);
            }
        }

        await refresh();
    }
}