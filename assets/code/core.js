// WebDesk 0.0.9
// Rebuild 7 (wtf)

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
            if (!$window.hasClass('max')) {
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
                el.sm.style.left = "4px";
                const btm = el.taskbar.getBoundingClientRect();
                el.sm.style.bottom = btm.height + btm.x + 4 + "px";
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
                el.cc.style.right = "4px";
                const btm = el.taskbar.getBoundingClientRect();
                el.cc.style.bottom = btm.height + btm.x + 4 + "px";
                tk.p(`Controls`, 'h2', el.cc);
                tk.p(`Your DeskID is ${sys.deskid}`, undefined, el.cc);
                const ok = tk.c('div', el.cc, 'embed nest');
                tk.cb('b3 b2', 'Settings', function () {
                    app.settings.init();
                    controlcenter();
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
        }
        if (waitopt === "wait") {
            setTimeout(function () { desktopgo(); }, 400);
        } else {
            desktopgo();
        }
    },
    clock: function () {
        const currentTime = new Date();
        let hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const seconds = currentTime.getSeconds();
        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        const elements = document.getElementsByClassName("time");
        for (let i = 0; i < elements.length; i++) {
            elements[i].innerText = formattedTime;
        }
    },
    finishsetup: function (name, div1, div2) {
        ui.sw2(div1, div2); ui.masschange('name', name); fs.write('/user/info/name', name); fs.write('/system/info/setuptime', Date.now()); fs.write('/system/info/setupver', abt.ver);
    },
    reboot: function () {
        window.location.reload();
    },
    dark: function () {
        ui.cv('ui1', 'rgb(40, 40, 40, 0.6)');
        ui.cv('ui2', '#1b1b1b');
        ui.cv('ui3', '#2b2b2b');
        ui.cv('bc', 'rgb(44, 44, 44, 0.5)');
        ui.cv('font', '#fff');
        fs.write('/user/info/lightdark', 'dark');
    },
    light: function () {
        ui.cv('ui1', 'rgb(255, 255, 255, 0.6)');
        ui.cv('ui2', '#ffffff');
        ui.cv('ui3', '#dddddd');
        ui.cv('bc', 'rgb(200, 200, 200, 0.6)');
        ui.cv('font', '#000');
        fs.del('/user/info/lightdark');
    },
    clearm: function () {
        ui.cv('ui1', 'rgb(255, 255, 255, 0)');
        ui.cv('ui2', 'rgba(var(--accent), 0.1)');
        ui.cv('ui3', 'rgba(var(--accent) 0.2)');
        ui.cv('bc', 'rgb(255, 255, 255, 0)');
        ui.cv('font', '#000');
        fs.write('/user/info/lightdark', 'clear');
    },
    clearm2: function () {
        wd.clearm();
        ui.cv('font', '#fff');
        fs.write('/user/info/lightdark', 'clear2');
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
        const sigma = gen(8);
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
        let downloadLink = document.createElement('a')
  
        if (typeof file === 'string' && file.startsWith('data:')) {
          downloadLink.href = file
          downloadLink.download = fileName
        } else if (file instanceof File || file instanceof Blob) {
          downloadLink.href = URL.createObjectURL(file)
          downloadLink.download = file.name || fileName
        }
      
        downloadLink.style.display = 'none'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }
}

setInterval(wd.clock, 1000);