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
        const a = ui.hextool(hex, 45);
        ui.theme(ui.hextool(hex, 25), a, ui.hextool(hex, 45), ui.hextool(hex, 55), ui.hextorgb(ui.hextool(hex, 55)));
        if (!opt === true) {
            await fs.write('/user/info/color', hex);
            if (sys.autodarkacc === true) {
                const silly = ui.hexdark(a);
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
    sw: function (d1, d2) {
        const dr1 = document.getElementById(d1);
        const dr2 = document.getElementById(d2);
        $(dr1).fadeOut(120, function () { $(dr2).fadeIn(120); });
    },
    sw2: function (d1, d2, fadetime) {
        if (fadetime) {
            $(d1).fadeOut(fadetime, function () { $(d2).fadeIn(fadetime); });
        } else {
            $(d1).fadeOut(120, function () { $(d2).fadeIn(120); });
        }
    },
    hide: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).fadeOut(anim);
            } else if (anim === 0) {
                $(dr1).hide();
            } else {
                $(dr1).fadeOut(210);
            }
        }
    },
    slidehide: function (dr1, anim) {
        if (dr1) {
            if (anim) {
                $(dr1).slideUp(anim);
            } else {
                $(dr1).slideUp(210);
            }
        }
    },
    play: function (filename) {
        const audio = new Audio(filename);
        audio.volume = sys.nvol;
        audio.play();
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

        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;

        let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance < 140;
    },
    hextorgb: function (hex) {
        hex = hex.replace(/^#/, '');
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return `${r}, ${g}, ${b}`;
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
                    'like', 'sad', 'shown', 'light', 'sit', 'sitting', 'site', 'ship', 'stop', 'kind', 'smart', 'kid', 'heart', 'hope', 'set', 'cat', 'photo', 'will', 'replace', 'say', 'shy', 'moon', 'think', 'Mike', 'clink', 'look', 'redo', 'hanger', 'change', 'changing', 'changes', 'due'
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
        if (!event || sys.mob === true) {
            ui.center(menu);
        } else if (menudiv === true) {
            const rect = menu.getBoundingClientRect();
            const button = btn.getBoundingClientRect();
            menu.style.left = event.clientX - rect.width + button.width + 4 + "px";
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
            if (parentDiv?.tagName === 'DIV' && ![menu].includes(parentDiv)) {
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
}
var tk = {
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
    img: function (src, classn, div, draggable) {
        const fuck = document.createElement('img');
        fuck.src = src;
        if (classn) {
            fuck.classList = classn;
        }
        if (draggable === false) {
            fuck.setAttribute('draggable', false);
        }
        div.appendChild(fuck);
        return fuck;
    },
    css: function (href) {
        const existingLink = Array.from(document.getElementsByTagName('link')).find(
            link => link.rel === 'stylesheet' && link.href === href
        );

        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = href;
            document.head.appendChild(link);
        }
    },
    cb: function (classn, name, func, ele) {
        const button = document.createElement('button');
        button.className = classn;
        button.innerText = ui.filter(name, button);
        if (func) {
            button.addEventListener('click', func);
        }
        if (ele) {
            ele.appendChild(button);
        }

        if ((classn.includes('b1') || classn.includes('b3')) && sys.lowgfx === false) {
            button.onmouseleave = (e) => {
                e.target.style.background = "rgba(var(--accent), 0.4)";
            };

            button.addEventListener("mousemove", (e) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.target.style.background = `radial-gradient(circle at ${x}px ${y}px , rgba(var(--accent), 0.62),rgba(var(--accent), 0.53))`;
            });
        }

        return button;
    },
    a: function (ele1, ele2) {
        ele1.appendChild(ele2);
    },
    mbw: function (title, wid, hei, full, min, quit) {
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
        var closeButton = document.createElement('button');
        if (sys.mobui === true) {
            closeButton.classList.add('b3');
            closeButton.innerText = "Quit";
        } else {
            closeButton.classList.add('winb');
        }
        let shortened;
        if (sys.mob === true) {
            shortened = ui.truncater(title, 7);
        } else {
            shortened = ui.truncater(title, 10);
        }
        const tbn = tk.cb('b1', shortened, function () {
            wm.show(windowDiv, tbn);
        }, el.tr);
        if (quit === undefined) {
            closeButton.classList.add('red');
            closeButton.addEventListener('mousedown', async function () {
                const mousedownevent = new MouseEvent('mousedown');
                windowDiv.dispatchEvent(mousedownevent);
                ui.dest(windowDiv, 130);
                ui.dest(tbn, 130);
                setTimeout(async function () {
                    const yeah = await ughfine(windowDiv);
                    if (yeah) {
                        yeah.dispatchEvent(mousedownevent);
                    } else {
                        if (el.menubarbtn) el.menubarbtn.innerText = "Desktop";
                    }
                }, 40);
            });
        }

        var minimizeButton = document.createElement('button');
        if (sys.mobui === true) {
            minimizeButton.classList.add('b3');
            minimizeButton.innerText = "Hide";
        } else {
            minimizeButton.classList.add('winb');
        }
        if (min === undefined && el.tr !== undefined) {
            minimizeButton.classList.add('yel');
            minimizeButton.addEventListener('mousedown', async function () {
                await wm.minimize(windowDiv, tbn);
            });
        }

        winbtns.appendChild(closeButton);
        winbtns.appendChild(minimizeButton);
        if (sys.mobui !== true) {
            var maximizeButton = document.createElement('button');
            maximizeButton.classList.add('winb');
            if (full === undefined) {
                maximizeButton.classList.add('gre');
                maximizeButton.addEventListener('mousedown', function () {
                    wm.max(windowDiv);
                });
                titlebarDiv.addEventListener('dblclick', function () {
                    wm.max(windowDiv);
                });
            }
            winbtns.appendChild(maximizeButton);
        }
        titlebarDiv.appendChild(winbtns);
        var titleDiv = document.createElement('div');
        titleDiv.classList.add('title');
        titleDiv.innerHTML = title;
        titlebarDiv.appendChild(titleDiv);
        windowDiv.appendChild(titlebarDiv);
        var contentDiv = document.createElement('div');
        contentDiv.classList.add('content');
        windowDiv.appendChild(contentDiv);
        document.body.appendChild(windowDiv);
        wd.win();
        wd.win(windowDiv, closeButton, minimizeButton, tbn);
        windowDiv.addEventListener('mousedown', function () {
            wd.win(windowDiv, closeButton, minimizeButton, tbn);
        });
        if (sys.mobui !== true) {
            setTimeout(function () { ui.center(windowDiv); }, 30);
        }
        return { win: windowDiv, main: contentDiv, tbn, title: titlebarDiv, closebtn: closeButton, winbtns, name: titleDiv, minbtn: minimizeButton };
    }
}
