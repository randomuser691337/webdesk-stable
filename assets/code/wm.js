var wm = {
    wal: function (content, btn1, name, opt) {
        const win = tk.mbw('Alert Window', '300px', 'auto', undefined, undefined, undefined);
        win.win.querySelector('.tb').remove();
        win.main.className = "d";
        wd.win();
        win.main.style.padding = "12px";
        const thing = document.createElement('div');
        thing.innerHTML = content;
        const thing2 = document.createElement('div');
        win.main.appendChild(thing);
        win.main.appendChild(thing2);
        if (opt !== "noclose") {
            tk.cb('b1', 'Close', function () { ui.dest(win.win, 100); ui.dest(win.tbn, 100); }, thing2);
        }

        if (btn1 !== undefined) {
            const btn = tk.cb('b1', name, function () { ui.dest(win.win, 100); ui.dest(win.tbn, 100); }, thing2);
            btn.addEventListener('click', btn1);
        }
    },
    snack: function (txt, time) {
        const div = tk.c('div', document.body, 'snack');
        div.innerText = txt;
        if (time) {
            setTimeout(() => {
                ui.dest(div, 300);
            }, time);
        } else {
            setTimeout(() => {
                ui.dest(div, 300);
            }, 4000);
        }
        div.addEventListener('click', function () {
            ui.dest(div, 140);
        });
    },
    center: function (element) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        const leftPosition = (screenWidth - elementWidth) / 2;
        const topPosition = (screenHeight - elementHeight) / 2;
        element.style.left = `${leftPosition}px`;
        element.style.top = `${topPosition}px`;
    },
    cm: function () {
        const div = document.createElement('div');
        div.classList = "cm";
        document.body.appendChild(div);
        div.addEventListener('click', () => ui.dest(div));
        return div;
    },
    max: function (wid) {
        if (wid) {
            wid.classList.toggle('max');
            if (!wid.classList.contains('max')) {
                wid.classList.add('unmax');
                setTimeout(() => {
                    wid.classList.remove('unmax');
                }, 301);
            }
        }
    },
    min: async function (wid, btn) {
        if (wid) {
            const $animatedDiv = $(wid);
            const isMinimized = wid.classList.toggle('minimized');
            if (isMinimized) {
                $animatedDiv.data('originalPOS', {
                    top: $animatedDiv.offset().top,
                    left: $animatedDiv.offset().left,
                });
                const yeah = await ughfine(wid);
                const mousedownevent = new MouseEvent('mousedown');
                if (yeah) {
                    yeah.dispatchEvent(mousedownevent);
                }
                const endOffset = btn.getBoundingClientRect();
                $animatedDiv.addClass("windowanim");
                $animatedDiv.animate({
                    top: endOffset.bottom,
                    left: endOffset.x,
                    opacity: 0,
                }, 220, "swing", function () {
                    $animatedDiv.hide();
                    $animatedDiv.removeClass("windowanim");
                });
            } else {
                wm.show(wid, btn);
            }
        }
    },
    show: function (wid, btn) {
        const isMinimized = wid.classList.contains('minimized');
        if (isMinimized) {
            const $animatedDiv = $(wid);
            const original = $animatedDiv.data('originalPOS');
            $animatedDiv.show().animate({
                top: original.top,
                left: original.left,
                opacity: 1,
            }, 220, "swing", function () {
                $animatedDiv.removeClass("minimized");
            });

        }
        wd.win(wid);
    },
    close: async function (window) {
        const mousedownevent = new MouseEvent('mousedown');
        focused.closebtn.dispatchEvent(mousedownevent);
    },
    minimize: async function (window, tbn) {
        const mousedownevent = new MouseEvent('mousedown');
        wm.min(window, tbn);
        setTimeout(async function () {
            const yeah = await ughfine(window);
            if (yeah) {
                yeah.dispatchEvent(mousedownevent);
            } else {
                el.menubarbtn.innerText = "Desktop";
            }
        }, 40);
    },
    notif: function (name, cont, mode, button, mute) {
        if (mute !== true) {
            ui.play(sys.notifsrc);
        }
        const div = tk.c('div', document.getElementById('notif'), 'notif');
        const title = tk.p(name, 'bold', div);
        let content;
        if (cont) {
            content = tk.p(cont, undefined, div);
        }
        const dbtn = tk.cb('b4', 'Close', function () {
            ui.dest(div, 240);
        }, div);
        let the = "Open";
        if (button) {
            the = button;
        }
        if (mode) {
            const open = tk.cb('b4', the, undefined, div);
            open.addEventListener('click', mode);
            open.addEventListener('click', function () { ui.dest(div, 120); });
        }
        const txt = tk.c('span', div, 'med');
        txt.innerText = ` ${wd.timecs(Date.now())}`
        return { div, title, content, dismiss: dbtn };
    }
}