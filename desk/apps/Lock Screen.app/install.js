app['lockscreen'] = {
    runs: false,
    name: 'Lock Screen',
    init: async function () {
        if (!el.lock && sys.contained === false) {
            wd.clock();
            el.lock = tk.c('div', document.body, 'lockscreen');
            const clock = tk.c('div', el.lock, 'center');
            ui.show(el.lock, 300);
            const img = tk.img(`https://openweathermap.org/img/wn/10d@2x.png`, 'locki', clock, undefined, true);
            const p = tk.p('--:--', 'time h2', clock);
            clock.style.maxWidth = "200px";
            let ok = false;
            if (sys.setupd === "eepy") {
                const selfdest = tk.p('Click anywhere to keep DeskID active and recieve notifications', undefined, clock);
                function yeah(e) {
                    document.body.removeEventListener('mousedown', yeah);
                    e.preventDefault();
                    ui.dest(selfdest);
                    ok = true;
                }

                document.body.addEventListener('mousedown', yeah);
            } else {
                ok = true;
            }
            const weather = tk.p('Loading', 'smtxt med', clock);
            p.style.color = weather.style.color = "#fff";
            const updateweather = async () => {
                try {
                    const response = await fetch(`https://weather.meower.xyz/json?city=${sys.city}&units=${sys.unit}`);
                    const info = await response.json();
                    weather.innerText = `${Math.ceil(info.main.temp)}${sys.unitsym}, ${info.weather[0].description}`;
                    img.src = `https://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png`;
                } catch (error) {
                    weather.innerText = "Error";
                }
            };
            const interval = setInterval(updateweather, 300000);
            let menuo = false;
            if (sys.setupd === "eepy") {
                el.lock.addEventListener('mousedown', async () => {
                    if (menuo === false && ok === true) {
                        const menu = tk.c('div', el.lock, 'cm');
                        el.lock.style.cursor = "default";
                        menu.style.width = "130px";
                        menuo = true;
                        tk.p('Exit Deep Sleep', 'bold', menu);
                        tk.cb('b1', 'Yes', async function () {
                            await fs.del('/system/eepysleepy');
                            sys.resume();
                            clearInterval(interval);
                            ui.dest(el.lock, 140);
                            el.lock = undefined;
                            ui.show(tk.g('contain'), 0);
                        }, menu);
                        tk.cb('b1', 'No', async function () {
                            ui.dest(menu);
                            el.lock.style.cursor = "none";
                            menuo = false;
                        }, menu);
                    }
                });
            } else {
                
                const listener = async function (event) {
                    if (event.key) {
                        event.preventDefault();
                        await unlock();
                        document.removeEventListener('keydown', listener);
                    }
                };
                
                document.addEventListener('keydown', listener);

                const what = el.lock.addEventListener('mousedown', async () => {
                    await unlock(what);
                    document.removeEventListener('keydown', listener);
                });      
            }

            async function unlock(listen) {
                const { innerHeight: windowHeight } = window;
                el.lock.style.transition = 'transform 0.3s ease';
                el.lock.style.transform = `translateY(-${windowHeight}px)`;
                await new Promise(resolve => {
                    el.lock.addEventListener('transitionend', function onTransitionEnd() {
                        el.lock.removeEventListener('transitionend', onTransitionEnd);
                        clearInterval(interval);
                        el.lock.remove();
                        el.lock = undefined;
                        resolve();
                        if (listen) {
                            listen.removeEventListener();
                        }
                    });
                });
            }
            await updateweather();
        }
    }
}