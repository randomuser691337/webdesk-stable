var ui = {
    cv: function (varName, varValue) {
        const root = document.documentElement;
        root.style.setProperty(`--${varName}`, `${varValue}`);
    },
    theme: function (background1, background2, shade1, shade2, accent) {
        ui.cv('bg1', background1); ui.cv('bg2', background2); ui.cv('sh1', shade1); ui.cv('sh2', shade2);
        ui.cv('accent', accent);
    },
    crtheme: async function (hex, opt) {
        if (!opt === true) {
            ui.cv('accent', ui.hextorgb(hex));
            await set.set('color', hex);
            if (sys.autodarkacc === true) {
                const silly = ui.hexdark(ui.hextorgb(hex));
                if (silly === true) {
                    wd.dark();
                } else {
                    wd.light();
                }
            }
        } else {
            console.log(`<i> Not setting theme, opt is set to true! (crtheme)`);
        }
    },
    getcl: function (imageSrc, callback) {
        // If it ain't broke, don't fix it
        var img = new Image();
        img.crossOrigin = "Anonymous"; // to avoid CORS issue
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var colorCount = {};
            var maxCount = 0;
            var mostUsedColor = [0, 0, 0];

            for (var i = 0; i < data.length; i += 4) {
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
                var rgb = r + ',' + g + ',' + b;
                if ((r > 100 && g < 100 && b < 100) ||
                    (r < 100 && g > 100 && b < 100) ||
                    (r < 100 && g < 100 && b > 100) ||
                    (r > 100 && g > 100 && b < 100) ||
                    (r > 100 && g < 100 && b > 100) ||
                    (r < 100 && g > 100 && b > 100)) {
                    if (!colorCount[rgb]) {
                        colorCount[rgb] = 0;
                    }
                    colorCount[rgb]++;
                    if (colorCount[rgb] > maxCount) {
                        maxCount = colorCount[rgb];
                        mostUsedColor = [r, g, b];
                    }
                }
            }

            // Make the color slightly darker if it's bright
            var [r, g, b] = mostUsedColor;
            var brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            if (brightness > 200) { // Adjust threshold as needed
                r = Math.max(0, r - r * 0.1);
                g = Math.max(0, g - g * 0.1);
                b = Math.max(0, b - b * 0.1);
                mostUsedColor = [r, g, b];
            }

            callback(mostUsedColor);
        };

        img.src = imageSrc;
    },
    sw: function (d1, d2) {
        const dr1 = document.getElementById(d1);
        const dr2 = document.getElementById(d2);
        $(dr1).fadeOut(sys.animspeed, function () { $(dr2).fadeIn(sys.animspeed); });
    },
    sw2: function (d1, d2, fadetime) {
        if (fadetime) {
            $(d1).fadeOut(fadetime, function () { $(d2).fadeIn(fadetime); });
        } else {
            $(d1).fadeOut(sys.animspeed, function () { $(d2).fadeIn(sys.animspeed); });
        }
    },
    hide: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).fadeOut(anim);
            } else if (anim === 0) {
                $(dr1).hide();
            } else {
                $(dr1).fadeOut(sys.animspeed2);
            }
        }
    },
    slidehide: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).slideUp(anim);
            } else {
                $(dr1).slideUp(sys.animspeed2);
            }
        }
    },
    play: async function (filename, type) {
        let ok;
        if (type) {
            ok = type;
        } else {
            ok = await fs.read(filename);
        }
        let audio;
        if (ok) {
            let correct;
            if (filename.endsWith('.wav')) {
                correct = ok.replace(/^data:application\/octet-stream/, 'data:audio/wav');
                audio = new Audio(correct);
            } else if (filename.endsWith('.mp3')) {
                correct = ok.replace(/^data:application\/octet-stream/, 'data:audio/mpeg');
                audio = new Audio(correct);
            } else {
                console.log(`<!> Audio file isn't wav or mp3, giving up`)
            }
        } else {
            audio = new Audio(filename);
        }

        audio.volume = sys.nvol;
        await audio.play();
        return audio;
    },
    show: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).fadeIn(anim);
            } else if (anim === 0) {
                $(dr1).show();
            } else {
                $(dr1).fadeIn(210);
            }
        }
    },
    showfi: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).fadeIn(anim).css("display", "inline-block");
            } else {
                $(dr1).fadeIn(170).css("display", "inline-block");
            }
        }
    },
    dest: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).fadeOut(anim, function () { dr1.remove(); });
            } else if (anim === 0) {
                dr1.remove();
            } else {
                $(dr1).fadeOut(170, function () { dr1.remove(); });
            }
        }
    },
    toggle: function (elementId, time3) {
        var element = document.getElementById(elementId);
        if (element) {
            if (element.style.display === '' || element.style.display === 'none') {
                element.style.display = 'block';
            } else {
                hidef(elementId, time3);
            }
        }
    },
    hidecls: function (className) {
        var elements = document.getElementsByClassName(className);
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none';
        }
    },
    showcls: function (className) {
        var elements = document.getElementsByClassName(className);
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = 'inline';
        }
    },
    masschange: function (classn, val) {
        const usernameElements = document.getElementsByClassName(classn);
        for (let i = 0; i < usernameElements.length; i++) {
            usernameElements[i].textContent = val;
        }
    },
    center: function (element) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        element.style.left = `${(screenWidth - elementWidth) / 2}px`;
        element.style.top = `${(screenHeight - elementHeight) / 2}px`;
    },
    hextool: function (hex, percent) {
        if (hex.startsWith('#')) {
            hex = hex.slice(1);
        }

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        percent = percent / 100;
        let adjustment = percent < 0.5 ? 255 * (0.5 - percent) : 255 * (percent - 0.5);

        if (percent < 0.5) {
            r = Math.min(255, r + adjustment);
            g = Math.min(255, g + adjustment);
            b = Math.min(255, b + adjustment);
        } else {
            r = Math.max(0, r - adjustment);
            g = Math.max(0, g - adjustment);
            b = Math.max(0, b - adjustment);
        }

        r = Math.round(r).toString(16).padStart(2, '0');
        g = Math.round(g).toString(16).padStart(2, '0');
        b = Math.round(b).toString(16).padStart(2, '0');

        return `#${r}${g}${b}`;
    },
    hexdark: function (hex) {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance < 128;
    },
    hextorgb: function (hex) {
        hex = hex.replace(/^#/, '');
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    },
    rgbtohex: function (rgb) {
        const [r, g, b] = rgb.split(',').map(Number);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    download: function (filename, data) {
        const blob = new Blob([data], { type: 'text/plain' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    copy: function (text) {
        navigator.clipboard.writeText(text);
    },
    truncater: function (inputString, size, dots) {
        if (inputString.length <= size) {
            return inputString;
        } else {
            if (dots !== false) {
                return inputString.slice(0, size - 2) + '..';
            } else {
                return inputString.slice(0, size);
            }
        }
    },
    key: function (element, keycode, action) {
        element.addEventListener('keydown', (event) => {
            if (event.key === keycode) {
                event.preventDefault();
                action();
            }
        });
    },
    filter: function (inputText, element) {
        if (sys.filter === true) {
            let found = false;
            try {
                const offensiveTerms = new Set([
                    // ChatGPT generated this, not me
                    'fuck', 'fucker', 'fucking', 'shit', 'bullshit', 'bitch', 'asshole', 'bastard', 'damn', 'dick', 'prick', 'cunt',
                    'nigg', 'chink', 'spic', 'cracker', 'gook', 'kike', 'wetback', 'gyppo',
                    'fag', 'faggot', 'dyke', 'tranny', 'shemale', 'homo',
                    'kill', 'murder', 'suici', 'selfharm', 'cutting', 'worthless', 'hopeless', 'die', 'death', 'harm', 'enditall', 'end it all', 'depress', 'jump', 'hang', 'hanging',
                    'rape', 'rapist', 'molest', 'molester', 'incest', 'pedophile', 'pedo', 'philia',
                    'retar', 'retard', 'idiot', 'moron', 'lunatic', 'crazy', 'psycho',
                    'worthless', 'loser', 'whore', 'slut', 'you pig', 'scum', 'filth', 'porn', 'sex',
                ]);

                const antiTerms = new Set([
                    'like', 'sad', 'shown', 'light', 'sit', 'sitting', 'site', 'ship', 'stop', 'kind', 'smart', 'kid', 'heart', 'hope', 'set', 'cat', 'photo', 'will', 'replace', 'say', 'shy', 'moon', 'think', 'Mike', 'clink', 'look', 'redo', 'hanger', 'change', 'changing', 'changes', 'due', 'epic'
                ]);

                const isSimilar = (word, term) => {
                    const editDistance = (a, b) => {
                        const dp = Array.from({ length: a.length + 1 }, (_, i) =>
                            Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
                        );
                        for (let i = 1; i <= a.length; i++) {
                            for (let j = 1; j <= b.length; j++) {
                                dp[i][j] =
                                    a[i - 1] === b[j - 1]
                                        ? dp[i - 1][j - 1]
                                        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
                            }
                        }
                        return dp[a.length][b.length];
                    };

                    const distance = editDistance(word, term);
                    return distance <= 1;
                };

                const words = inputText.split(/\b/);
                const filteredWords = words.map(word => {
                    const lowerWord = word.toLowerCase();

                    for (const term of offensiveTerms) {
                        if (lowerWord.includes(term) || isSimilar(lowerWord, term)) {
                            for (const anti of antiTerms) {
                                if (lowerWord === anti) {
                                    return word;
                                }
                            }
                            found = true;
                            return '[filtered]';
                        }
                    }

                    return word;
                });
                if (found === true && sys.nc === true) {
                    return '[No chances filter]';
                } else {
                    return filteredWords.join('');
                }
            } catch (error) {
                console.log(error);
                if (element) {
                    element.addEventListener('mouseover', function () {
                        let stillwater = true;
                        setTimeout(() => {
                            if (stillwater) {
                                element.innerText = inputText;
                            }
                        }, 500);
                        element.addEventListener('mouseout', function handleMouseOut() {
                            stillwater = false;
                            element.removeEventListener('mouseout', handleMouseOut);
                        });
                    });
                    return `[Failed to filter, hover to view at your risk]`;
                } else {
                    return `[Failed to filter]`;
                }
            }
        } else {
            return inputText;
        }
    },
    tooltip: function (element, text) {
        // Should I tip him, or should I give him my tip?
        let stillwater = true;
        let el = undefined;
        function bye() {
            el.removeEventListener('mouseover', bye);
            document.body.removeEventListener('mousemove', bye);
            el.remove();
            el = undefined;
        }
        if (sys.mob === true) {
            let isLongPress = false;
            let timer;

            element.addEventListener('touchstart', e => {
                e.preventDefault();
                isLongPress = false;
                timer = setTimeout(() => {
                    isLongPress = true;
                    el = tk.c('div', document.body, 'tooltip');
                    el.innerText = ui.filter(text);
                    document.body.addEventListener('mousemove', bye);
                }, 500);
            });

            element.addEventListener('touchend', () => {
                clearTimeout(timer);
                if (!isLongPress) {
                    stillwater = false;
                    clearTimeout(timer);
                    element.click();
                }
            });

            element.addEventListener('touchmove', () => clearTimeout(timer));
            element.addEventListener('touchcancel', () => clearTimeout(timer));
        } else {
            element.addEventListener('contextmenu', function (e) {
                if (stillwater === true) {
                    e.preventDefault();
                    el = tk.c('div', document.body, 'tooltip');
                    el.innerText = ui.filter(text);
                    el.addEventListener('mouseover', bye);
                    document.body.addEventListener('mousemove', bye);
                }
            });
        }
    },
    rightclick: function (menu, event, btn, menudiv) {
        if (!event || sys.mobui === true) {
            ui.center(menu);
        } else if (menudiv === true) {
            const rect = menu.getBoundingClientRect();
            const button = btn.getBoundingClientRect();
            menu.style.left = event.clientX - rect.width + button.width + "px";
            menu.style.top = event.clientY + button.height + 4 + "px";
        } else {
            menu.style.left = event.clientX - 10 + "px";
            menu.style.top = event.clientY - 10 + "px";
        }

        if (btn) {
            const hover = new Event('mouseover');
            btn.dispatchEvent(hover);
        }
        document.body.addEventListener('mousedown', function (event) {
            const parentDiv = event.target.parentElement;
            if (![menu].includes(parentDiv)) {
                if (btn) {
                    const stop = new Event('mouseout');
                    btn.dispatchEvent(stop);
                }
                ui.dest(menu, 50);
            }
        });
    },
    note: function (contents, div) {
        const fuck = document.createElement('span');
        fuck.innerHTML = ui.filter(" " + contents, fuck);
        fuck.classList = 'rsmtxt';
        fuck.style.opacity = "70%";
        div.appendChild(fuck);
        return fuck;
    },
    darken: function () {
        return tk.c('div', document.body, 'darkscreen');
    },
}
var tk = {
    loadbar: function (el) {
        const bar = tk.c('div', el, 'line-wobble');
        return bar;
    },
    emojicon: function (element, emote, color, text) {
        element.innerHTML = `<span class="emojicon" style="background-color: ${color}">${emote}</span> ${text}`
    },
    c: function (type, ele, classn) {
        const ok = document.createElement(type);
        if (ele) {
            ele.appendChild(ok);
        }
        if (classn) {
            ok.classList = classn;
        }
        return ok;
    },
    g: function (element) {
        return document.getElementById(element);
    },
    line: function (ele) {
        const ok = tk.c('div', ele, 'line');
        const no = tk.c('div', ok, 'lineinside');
    },
    t: function (ele, text) {
        ele.innerHTML = text;
    },
    p: function (contents, classn, div) {
        const fuck = document.createElement('p');
        fuck.innerHTML = ui.filter(contents, fuck);
        if (classn) {
            fuck.classList = classn;
        }
        div.appendChild(fuck);
        return fuck;
    },
    ps: function (contents, classn, div) {
        const fuck = document.createElement('p');
        fuck.innerText = ui.filter(contents, fuck);
        if (classn) {
            fuck.classList = classn;
        }
        div.appendChild(fuck);
        return fuck;
    },
    img: async function (src, classn, div, draggable, directurl) {
        const fuck = document.createElement('img');
        div.appendChild(fuck);
        async function reload(param) {
            try {
                const data = await fs.read(src);
                if (data) {
                    if (typeof data === 'string') {
                        if (data.startsWith('<svg')) {
                            const blob = new Blob([data], { type: 'image/svg+xml' });
                            fuck.src = URL.createObjectURL(blob);
                        } else {
                            fuck.src = data;
                        }
                    } else if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
                        const base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
                        fuck.src = `data:image/png;base64,${base64String}`;
                    } else {
                        console.error('Unsupported data type for image rendering.');
                    }
                } else {
                    fuck.src = src;
                }
            } catch (error) {
                console.log(error);
                fuck.src = src;
                console.log(data);
            }
        }
        if (classn) {
            fuck.classList = classn;
        }
        if (draggable === false) {
            fuck.setAttribute('draggable', false);
        }
        if (directurl !== true) {
            await reload();
        } else {
            fuck.src = src;
        }
        let edit = {
            load: async function (new2) {
                src = new2;
                await reload();
            }
        }
        return { img: fuck, edit };
    },
    css: function (path) {
        return initcss(path);
    },
    cb: function (classn, name, func, ele) {
        const button = document.createElement('button');
        button.className = classn;
        if (func) {
            button.addEventListener('click', func);
        }
        if (ele) {
            ele.appendChild(button);
        }

        if ((classn.includes('b1'))) {
            const span = tk.c('div', button, 'b1material');
            span.innerText = ui.filter(name, button);
            if (classn.includes('nodont') || sys.lowgfx === true) {
                span.style.backgroundColor = "rgb(0, 0, 0, 0)";
            }
        } else {
            button.innerText = ui.filter(name, button);
        }

        /* if ((classn.includes('b1') || classn.includes('b3')) && (sys.lowgfx === false && !classn.includes('nodont'))) {
            button.onmouseleave = (e) => {
                e.target.style.background = "rgba(var(--accent), 0.4)";
            };

            button.addEventListener("mousemove", (e) => {
                if (e.target === button) {
                    const rect = e.target.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    e.target.style.background = `radial-gradient(circle at ${x}px ${y}px , rgba(var(--accent), 0.63),rgba(var(--accent), 0.53))`;
                }
            });
        } */

        return button;
    },
    a: function (ele1, ele2) {
        ele1.appendChild(ele2);
    },
    mbw: function (title, wid, hei, full, min, quit, icon, resize) {
        var windowDiv = document.createElement('div');
        windowDiv.classList.add('window');
        windowDiv.setAttribute('wdname', title);
        var titlebarDiv = tk.c('div', undefined, 'd tb');
        if (sys.mobui !== true) {
            windowDiv.style.width = wid;
            windowDiv.style.height = hei;
            windowDiv.style.maxWidth = "80vw";
            windowDiv.style.maxHeight = "90vh";
        } else {
            const btm2 = el.mbpos;
            windowDiv.style.top = btm2.height + 8 + "px";
            windowDiv.style.left = "8px";
            windowDiv.style.right = "8px";
            windowDiv.style.boxShadow = "none";
            windowDiv.style.resize = "none";
            const btm = el.tbpos;
            windowDiv.style.bottom = btm.height + 12 + "px";
        }

        var winbtns = tk.c('div', undefined, 'tnav');
        var winbtnc = tk.c('div', winbtns, 'tnavc');
        var closeButton = document.createElement('button');
        let closeButtonNest = document.createElement('button');
        if (sys.mobui === true) {
            closeButtonNest.classList.add('winbmob');
            closeButton.classList.add('b3');
            closeButton.innerText = "Quit";
        } else {
            closeButtonNest.classList.add('winbnest');
            closeButton.classList.add('winb');
        }

        closeButtonNest.appendChild(closeButton);
        let shortened;
        if (sys.mob === true) {
            shortened = ui.truncater(title, 12);
        } else {
            shortened = ui.truncater(title, 60);
        }
        const tbn = tk.cb('tbbutton', '', function () {
            wm.show(windowDiv, tbn);
        }, el.tr);
        if (icon) {
            tk.img(icon, 'dockicon', tbn, false, 'noretry');
        } else {
            tk.img('/system/lib/img/icons/noicon.svg', 'dockicon', tbn, false, 'noretry');
        }

        const tooltip = tk.c('div', document.body, 'tooltipd');
        tooltip.textContent = shortened;

        function updateTooltipPosition() {
            const { x, width } = tbn.getBoundingClientRect();
            tooltip.style.left = `${x + width / 2 - tooltip.offsetWidth / 2}px`;
            setTimeout(updateTooltipPosition, 200);
        }

        window.addEventListener("resize", updateTooltipPosition);

        if (el.taskbar) {
            new ResizeObserver(updateTooltipPosition).observe(el.taskbar);
        }

        updateTooltipPosition();
        const showTooltip = () => { tooltip.classList.add('visible'); };
        const hideTooltip = () => { tooltip.classList.remove('visible'); };
        tbn.addEventListener('mouseenter', showTooltip);
        tbn.addEventListener('mouseleave', hideTooltip);

        const removeTooltipListener = () => {
            tbn.removeEventListener('mouseenter', showTooltip);
            tbn.removeEventListener('mouseleave', hideTooltip);
        };

        if (quit === undefined) {
            closeButton.classList.add('red');
            closeButtonNest.addEventListener('click', async function () {
                const mousedownevent = new MouseEvent('click');
                windowDiv.dispatchEvent(mousedownevent);
                ui.dest(windowDiv, 0);
                ui.dest(tbn, 0);
                removeTooltipListener();
                setTimeout(async function () {
                    const yeah = ughfine(windowDiv);
                    if (yeah) {
                        yeah.dispatchEvent(mousedownevent);
                    } else {
                        if (el.menubarbtn) el.menubarbtn.innerText = "Desktop";
                    }
                }, 40);
            });
        } else {
            closeButton.classList.add('grey');
        }
        let minimizeButton = document.createElement('button');
        let minimizeButtonNest = document.createElement('button');
        if (sys.mobui === true) {
            minimizeButtonNest.classList.add('winbmob');
            minimizeButton.classList.add('b3');
            minimizeButton.innerText = "Hide";
        } else {
            minimizeButtonNest.classList.add('winbnest');
            minimizeButton.classList.add('winb');
        }
        minimizeButtonNest.appendChild(minimizeButton);
        if (min === undefined && el.tr !== undefined) {
            minimizeButton.classList.add('yel');
            minimizeButtonNest.addEventListener('click', async function () {
                await wm.minimize(windowDiv, tbn);
            });
        } else {
            minimizeButton.classList.add('grey');
        }
        winbtnc.appendChild(closeButtonNest);
        winbtnc.appendChild(minimizeButtonNest);
        if (sys.mobui !== true) {
            var maximizeButton = document.createElement('button');
            const maximizeButtonNest = document.createElement('button');
            maximizeButtonNest.classList.add('winbnest');
            maximizeButton.classList.add('winb');
            maximizeButtonNest.appendChild(maximizeButton);
            if (full === undefined) {
                maximizeButton.classList.add('gre');
                maximizeButton.addEventListener('click', function () {
                    wm.max(windowDiv);
                });
                titlebarDiv.addEventListener('dblclick', function () {
                    wm.max(windowDiv);
                });
            } else {
                maximizeButton.classList.add('grey');
            }
            winbtnc.appendChild(maximizeButtonNest);
        }
        titlebarDiv.appendChild(winbtns);
        var titleDiv = document.createElement('div');
        titleDiv.classList = 'title wintitle';
        titleDiv.innerHTML = title;
        titlebarDiv.appendChild(titleDiv);
        windowDiv.appendChild(titlebarDiv);
        var contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
        windowDiv.appendChild(contentDiv);
        document.body.appendChild(windowDiv);
        wd.win();
        wd.win(windowDiv, closeButtonNest, minimizeButtonNest, tbn);
        windowDiv.addEventListener('click', function () {
            wd.win(windowDiv, closeButtonNest, minimizeButtonNest, tbn);
        });
        if (sys.mobui !== true) {
            setTimeout(function () { ui.center(windowDiv); }, 10);
        }
        if (resize !== true) {
            const resizeBarStyles = {
                position: 'absolute',
                background: 'transparent',
                zIndex: 9999,
                cursor: 'ew-resize'
            };

            const resizeBars = [
                { side: 'top', cursor: 'ns-resize', style: { top: '-1px', left: 0, right: 0, height: '7px' } },
                { side: 'bottom', cursor: 'ns-resize', style: { bottom: '-1px', left: 0, right: 0, height: '7px' } },
                { side: 'left', cursor: 'ew-resize', style: { top: 0, bottom: 0, left: '-1px', width: '7px' } },
                { side: 'right', cursor: 'ew-resize', style: { top: 0, bottom: 0, right: '-1px', width: '7px' } }
            ];

            resizeBars.forEach(bar => {
                const resizeBar = document.createElement('div');
                Object.assign(resizeBar.style, resizeBarStyles, bar.style);
                resizeBar.style.cursor = bar.cursor;
                windowDiv.appendChild(resizeBar);

                resizeBar.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(document.defaultView.getComputedStyle(windowDiv).width, 10);
                    const startHeight = parseInt(document.defaultView.getComputedStyle(windowDiv).height, 10);

                    function doDrag(e) {
                        if (bar.side === 'right') {
                            windowDiv.style.width = (startWidth + e.clientX - startX) + 'px';
                        } else if (bar.side === 'left') {
                            const newWidth = startWidth - (e.clientX - startX);
                            if (newWidth > 0) {
                                windowDiv.style.width = newWidth + 'px';
                                windowDiv.style.left = e.clientX + 'px';
                            }
                        } else if (bar.side === 'bottom') {
                            windowDiv.style.height = (startHeight + e.clientY - startY) + 'px';
                        } else if (bar.side === 'top') {
                            const newHeight = startHeight - (e.clientY - startY);
                            if (newHeight > 0) {
                                windowDiv.style.height = newHeight + 'px';
                                windowDiv.style.top = e.clientY + 'px';
                            }
                        }
                    }

                    function stopDrag() {
                        document.documentElement.removeEventListener('mousemove', doDrag, false);
                        document.documentElement.removeEventListener('mouseup', stopDrag, false);
                    }

                    document.documentElement.addEventListener('mousemove', doDrag, false);
                    document.documentElement.addEventListener('mouseup', stopDrag, false);
                }, false);
            });
        }
        return { win: windowDiv, main: contentDiv, tbn, title: titlebarDiv, closebtn: closeButtonNest, winbtns, name: titleDiv, minbtn: minimizeButtonNest };
    }
}
