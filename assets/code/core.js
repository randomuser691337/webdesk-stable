// WebDesk 0.1.4
// Based on Rebuild 7 (wtf)

function gen(length) {
    if (length <= 0) {
        console.error('Length should be greater than 0');
        return null;
    }

    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function gens(length) {
    if (length <= 0) {
        console.error('Length should be greater than 0');
        return null;
    }

    const array = new Uint32Array(Math.ceil(length / 4));
    window.crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < array.length; i++) {
        result += array[i].toString(16).padStart(8, '0');
    }

    return result.slice(0, length);
}

var wd = {
    win: function (winfocus) {
        if (winfocus) {
            var $winfocus = $(winfocus);
            if ($winfocus.length) {
                var windows = $('.window');
                var highestZIndex = Math.max.apply(null, windows.map(function () {
                    var zIndex = parseInt($(this).css('z-index')) || 0;
                    return zIndex;
                }).get());
                $winfocus.css('z-index', highestZIndex + 1);
                $('.window').removeClass('winf');
                $winfocus.addClass('winf');
            }
            return;
        }

        $('.d').not('.dragged').on('mousedown touchstart', function (event) {
            var $window = $(this).closest('.window');
            if (!$window.hasClass('max') && sys.mob !== true) {
                var offsetX, offsetY;
                var windows = $('.window');
                var highestZIndex = Math.max.apply(null, windows.map(function () {
                    var zIndex = parseInt($(this).css('z-index')) || 0;
                    return zIndex;
                }).get());
                $window.css('z-index', highestZIndex + 1);
                $('.window').removeClass('winf');
                $window.addClass('winf');

                if (event.type === 'mousedown') {
                    offsetX = event.clientX - $window.offset().left;
                    offsetY = event.clientY - $window.offset().top;
                } else if (event.type === 'touchstart') {
                    var touch = event.originalEvent.touches[0];
                    offsetX = touch.clientX - $window.offset().left;
                    offsetY = touch.clientY - $window.offset().top;
                }

                $(document).on('mousemove touchmove', function (event) {
                    var newX, newY;
                    if (event.type === 'mousemove') {
                        newX = event.clientX - offsetX;
                        newY = event.clientY - offsetY;
                        $window.addClass('dragging');
                    } else if (event.type === 'touchmove') {
                        var touch = event.originalEvent.touches[0];
                        newX = touch.clientX - offsetX;
                        newY = touch.clientY - offsetY;
                        $window.addClass('dragging');
                    }

                    $window.offset({ top: newY, left: newX });
                });

                $(document).on('mouseup touchend', function () {
                    $(document).off('mousemove touchmove');
                    $window.removeClass('dragging');
                });

                document.body.addEventListener('touchmove', function (event) {
                    event.preventDefault();
                }, { passive: false });

            }
        });
    },
    desktop: function (name, deskid, waitopt) {
        ui.dest(tk.g('setuparea'));
        function startmenu() {
            if (el.sm == undefined) {
                el.sm = tk.c('div', document.body, 'tbmenu');
                el.sm.style.width = "200px";
                el.sm.style.left = "5px";
                const btm = el.taskbar.getBoundingClientRect();
                el.sm.style.bottom = btm.height + btm.x + 5 + "px";
                tk.p(`Hello, ${name}!`, 'h2', el.sm);
                tk.p(`Your DeskID is ${sys.deskid}`, undefined, el.sm);
                const ok = tk.c('div', el.sm, 'embed nest');
                for (var key in app) {
                    if (app.hasOwnProperty(key)) {
                        if (app[key].hasOwnProperty("runs") && app[key].runs === true) {
                            const btn = tk.cb('b3 b2', app[key].name, app[key].init.bind(app[key]), ok);
                            btn.addEventListener('click', function () {
                                ui.dest(el.sm, 150);
                                el.sm = undefined;
                            });
                            btn.style.textAlign = "left";
                        }
                    }
                }
                wd.reorg(ok);
            } else {
                ui.dest(el.sm, 150);
                el.sm = undefined;
            }
        }
        function controlcenter() {
            if (el.cc == undefined) {
                el.cc = tk.c('div', document.body, 'tbmenu');
                el.cc.style.width = "200px";
                el.cc.style.right = "5px";
                const btm = el.taskbar.getBoundingClientRect();
                el.cc.style.bottom = btm.height + btm.x + 5 + "px";
                tk.p(`Controls`, 'h2', el.cc);
                tk.p(`Your DeskID is ${sys.deskid}`, undefined, el.cc);
                const ok = tk.c('div', el.cc, 'embed nest');
                tk.cb('b3 b2', 'Sleep', function () {
                    app.lockscreen.init();
                }, ok);
                tk.cb('b3 b2', 'Reboot/Reload', function () {
                    wd.reboot();
                }, ok);
                tk.cb('b3 b2', 'Toggle Fullscreen', function () {
                    wd.fullscreen();
                    controlcenter();
                }, ok);
                tk.cb('b3 b2', 'Add File', function () {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.style.display = 'none';
                    input.addEventListener('change', function (event) {
                        const file = event.target.files[0];
                        if (file) {
                            const reader = new FileReader();

                            reader.onload = async function (e) {
                                const silly = e.target.result;
                                await fs.write(`/user/files/` + file.name, silly);
                            };

                            reader.readAsDataURL(file);
                        }
                    });

                    input.click();
                    controlcenter();
                }, ok);
            } else {
                ui.dest(el.cc, 150);
                el.cc = undefined;
            }
        }
        function desktopgo() {
            el.taskbar = tk.c('div', document.body, 'taskbar');
            const lefttb = tk.c('div', el.taskbar, 'tnav');
            const titletb = tk.c('div', el.taskbar, 'title');
            const start = tk.cb('b1', 'Apps', () => startmenu(), lefttb);
            el.tr = tk.c('div', lefttb);
            tk.cb('b1 time', '--:--', () => controlcenter(), titletb);
            if (sys.mob === true) {
                el.tb.style.boxShadow = "none";
            }
        }
        if (waitopt === "wait") {
            setTimeout(function () { desktopgo(); }, 300);
        } else {
            desktopgo();
        }
    },
    clock: function () {
        const currentTime = new Date();
        let hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const formattedHours = `${hours}`;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedTime = sys.seconds
            ? `${formattedHours}:${formattedMinutes}:${currentTime.getSeconds().toString().padStart(2, '0')} ${ampm}`
            : `${formattedHours}:${formattedMinutes} ${ampm}`;
        const elements = document.getElementsByClassName("time");
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerText = formattedTime;
        }
    },
    finishsetup: function (name, div1, div2) {
        ui.sw2(div1, div2); ui.masschange('name', name); fs.write('/user/info/name', name); fs.write('/system/info/setuptime', Date.now()); fs.write('/system/info/setupver', abt.ver);
    },
    reboot: function () {
        ui.show(document.getElementById('death'), 200);
        setTimeout(function () {
            if (window.location.href.includes('echodesk')) {
                window.location.reload();
            } else {
                window.location.href = window.location.origin;
            }
        }, 200);
    },
    dark: function (fucker) {
        ui.cv('ui1', 'rgb(45, 45, 45, 0.6)');
        ui.cv('ui2', '#1b1b1b');
        ui.cv('ui3', '#2b2b2b');
        ui.cv('bc', 'rgb(60, 60, 60, 0.4)');
        ui.cv('font', '#fff');
        if (fucker !== "nosave") {
            fs.write('/user/info/lightdark', 'dark');
        }
        ui.light = false;
    },
    light: function (fucker) {
        ui.cv('ui1', 'rgb(255, 255, 255, 0.6)');
        ui.cv('ui2', '#ffffff');
        ui.cv('ui3', '#ededed');
        ui.cv('bc', 'rgb(220, 220, 220, 0.4)');
        ui.cv('font', '#000');
        if (fucker !== "nosave") {
            fs.write('/user/info/lightdark', 'light');
        }
        ui.light = true;
    },
    clearm: function (fucker) {
        ui.cv('ui1', 'rgb(255, 255, 255, 0.2)');
        ui.cv('ui2', 'rgba(var(--accent), 0.1)');
        ui.cv('ui3', 'rgba(var(--accent) 0.2)');
        ui.cv('bc', 'rgb(255, 255, 255, 0)');
        ui.cv('font', '#000');
        if (fucker !== "nosave") {
            fs.write('/user/info/lightdark', 'clear');
        }
        ui.light = true;
    },
    clearm2: function (fucker) {
        wd.clearm();
        ui.cv('font', '#fff');
        if (fucker !== "nosave") {
            fs.write('/user/info/lightdark', 'clear2');
        }
        ui.light = false;
    },
    timec: function (id) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const date = new Date(id);

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: timeZone
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedParts = formatter.formatToParts(date);

        const month = formattedParts.find(part => part.type === 'month').value;
        const day = formattedParts.find(part => part.type === 'day').value;
        const year = formattedParts.find(part => part.type === 'year').value;
        const hour = formattedParts.find(part => part.type === 'hour').value;
        const minute = formattedParts.find(part => part.type === 'minute').value;
        const ampm = formattedParts.find(part => part.type === 'dayPeriod').value;

        return `${month} ${day}, ${year}, ${hour}:${minute}${ampm}`;
    },
    timecs: function (id) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const date = new Date(id);

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: timeZone
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedParts = formatter.formatToParts(date);

        const month = formattedParts.find(part => part.type === 'month').value;
        const day = formattedParts.find(part => part.type === 'day').value;
        const year = formattedParts.find(part => part.type === 'year').value;
        const hour = formattedParts.find(part => part.type === 'hour').value;
        const minute = formattedParts.find(part => part.type === 'minute').value;
        const ampm = formattedParts.find(part => part.type === 'dayPeriod').value;

        return `${hour}:${minute}${ampm}`;
    },
    reorg: function (element) {
        const buttons = Array.from(element.querySelectorAll('button'));
        buttons.sort((a, b) => a.textContent.localeCompare(b.textContent));
        element.innerHTML = '';
        let currentLetter = '';

        buttons.forEach(button => {
            const firstLetter = button.textContent.charAt(0).toUpperCase();
            if (firstLetter !== currentLetter) {
                currentLetter = firstLetter;
            }

            element.appendChild(button);
        });
    },
    fakedown: async function (obj) {
        if (Array.isArray(obj)) {
            for (const item of obj) {
                await wd.fakedown(item);
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
                if (key === 'ver') {
                    obj[key] = 1.0;
                } else {
                    await wd.fakedown(obj[key]);
                }
            }
        }
        console.log(JSON.stringify(obj, null, 4));
        await fs.write('/system/apps.json', JSON.stringify(obj, null, 4));
    },
    newid: async function () {
        const sigma = gen(7);
        await fs.write('/system/deskid', sigma);
        return sigma;
    },
    fullscreen: async function () {
        if (document.fullscreenElement) {
            sys.full = false;
            document.exitFullscreen();
        } else {
            sys.full = true;
            document.documentElement.requestFullscreen();
        }
    },
    download: function (file, fileName) {
        let downloadLink = document.createElement('a');
        let url;
    
        if (typeof file === 'string' && file.startsWith('data:')) {
            url = file;
        } else if (file instanceof File || file instanceof Blob) {
            url = URL.createObjectURL(file);
        } else if (typeof file === 'string') {
            const blob = new Blob([file], { type: 'text/plain' });
            url = URL.createObjectURL(blob);
        } else {
            const blob = new Blob([JSON.stringify(file)], { type: 'application/json' });
            url = URL.createObjectURL(blob);
        }
    
        downloadLink.href = url;
        downloadLink.download = fileName || file.name || 'download';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        if (file instanceof Blob || file instanceof File || url.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    },     
    smft: function () {
        ui.cv('fz4', '10px');
        ui.cv('fz3', '11px');
        ui.cv('fz2', '12px');
        ui.cv('fz1', '13px');
    },
    meft: function () {
        ui.cv('fz4', '12px');
        ui.cv('fz3', '13px');
        ui.cv('fz2', '14px');
        ui.cv('fz1', '15px');
    },
    bgft: function () {
        ui.cv('fz4', '13px');
        ui.cv('fz3', '14px');
        ui.cv('fz2', '15px');
        ui.cv('fz1', '17px');
    },
    loadapps: async function (inapp, onlineApps, apps) {
        const onlineApp = onlineApps.find(app => app.appid === inapp.appid);
        if (onlineApp === undefined) {
            if (sys.dev === true) {
                const fucker = await fs.read(inapp.exec);
                eval(fucker);
            } else {
                wm.notif(inapp.name + ` isn't recognized`, `This app has been blocked for safety. For more details, hit "Open".`, function () {
                    const thing = tk.c('div', document.body, 'cm');
                    tk.p(`This app isn't on the App Market, so it's been flagged and blocked.`, undefined, thing);
                    tk.p(`If you didn't add this, remove all apps. Their data will be saved.`, undefined, thing);
                    tk.p(`If you want to use this app, enable Developer Mode in Settings.`, undefined, thing);
                    tk.cb('b1 b2', 'Remove All Apps', async function () {
                        await fs.del('/system/apps.json');
                        await fs.delfold('/system/apps');
                        await wd.reboot();
                    }, thing);
                    tk.cb('b1 b2', 'Open Settings', function () {
                        app.settings.init();
                        ui.dest(thing);
                    }, thing);
                    tk.cb('b1', 'Close', function () {
                        ui.dest(thing);
                    }, thing);
                });
            }
        } else {
            if (onlineApp.ver === inapp.ver && sys.fucker === false) {
                console.log(`<i> ${inapp.name} is up to date (${inapp.ver} = ${onlineApp.ver})`);
                const fucker = await fs.read(inapp.exec);
                if (fucker) {
                    eval(fucker);
                } else {
                    fs.del('/system/apps.json');
                    fs.delfold('/system/apps');
                    wm.notif('App Issues', 'All apps were uninstalled due to corruption or an update. Your data is safe, you can reinstall them anytime.', () => app.appmark.init(), 'App Market');
                    sys.fucker = true;
                    return;
                }
            } else {
                const remove = apps.filter(item => item.appid !== inapp.appid);
                const removed = JSON.stringify(remove);
                fs.write('/system/apps.json', removed);
                app.appmark.create(onlineApp.path, onlineApp, true);
                console.log(`<!> ${inapp.name} was updated (${inapp.ver} --> ${onlineApp.ver})`);
            }
        }
    },
    perfmon: function () {
        if (performance.memory) {
            setInterval(() => {
                const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
                if (memoryUsage > 0.75) {
                    app.ach.unlock(`Time to make the chimichangas!`, `Quite literally, if your device gets that hot.`);
                    wm.notif(`STOP WHATEVER YOU'RE DOING`, `WebDesk is going to crash due to overuse of resources, or it will start deleting things from memory.`);
                }
            }, 4000);
        }
    },
    seasonal: function () {
        const today = new Date();
        if (today.getMonth() === 9 && today.getDate() === 31) {
            ui.crtheme('#694700');
            wd.dark();
            wm.notif(`Happy Halloween!`, `To those who celebrate it. If you don't like the color, you can use the default.`, function () {
                ui.crtheme('#7A7AFF');
                wd.light();
            }, 'Set defaults');
        } else if (today.getMonth() === 11 && today.getDate() === 25) {
            wm.notif(`Merry Christmas!`, `To those who celebrate it. If you don't like the color, you can use the default.`, function () {
                ui.crtheme('#00412A');
                wd.dark();
            }, 'Set defaults');
        } else {
            ui.crtheme('#7A7AFF');
        }
    },
    savecity: async function () {
        const ipinfoResponse = await fetch('https://ipinfo.io/json');
        const ipinfoData = await ipinfoResponse.json();
        const city = ipinfoData.city;
        const region = ipinfoData.region;
        const country = ipinfoData.country;
        const unit = (country === 'US') ? 'Imperial' : 'Metric';

        return {
            location: `${city}, ${region}, ${country}`,
            unit: unit
        }
    }
}

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        app.lockscreen.init();
    }
});

setInterval(wd.clock, 1000);