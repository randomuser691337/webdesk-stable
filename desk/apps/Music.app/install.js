app['music'] = {
    runs: true,
    name: 'Music',
    init: async function (path, name) {
        const win = tk.mbw('Music', '320px', '240px', true, undefined, undefined, '/apps/Music.app/Contents/icon.svg');
        win.main.style.display = "flex";
        win.main.style.padding = "0px";
        const half1 = tk.c('div', win.main);
        const half2 = tk.c('div', win.main);
        half1.style.width = "50%";
        half2.style.width = "50%";
        half1.style.height = "100%";
        half1.style.padding = "5px";
        half2.style.height = "100%";
        half2.style.padding = "8px";
        half1.style.boxSizing = "border-box";
        half2.style.boxSizing = "border-box";
        half2.style.display = "flex";
        half2.style.alignItems = "center";
        half2.style.justifyContent = "center";
        half1.style.borderRight = "1px solid var(--bc)";
        half1.style.backgroundColor = "var(--ui3)";
        half1.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.12)";
        half1.style.zIndex = "2";
        half1.style.overflow = "auto";
        half1.style.maxHeight = "100%";
        half2.style.overflow = "auto";
        half2.style.maxHeight = "100%";
        const bar = tk.c('div', half1, 'setupbar');
        bar.style.marginBottom = "2px";
        bar.style.fontSize = "var(--fz3)";
        tk.c('span', bar, 'time bold');
        const mainm = tk.c('div', half1);
        let audio;
        function stopmusic() {
            if (audio) {
                audio.pause();
                audio = null;
            }
            nowplay.innerHTML = "";
            nowplaytxt.innerText = "Manage what's playing";
        }
        async function shuffle() {
            const div = tk.c('div', document.body, 'hide');
            const ok = await fs.ls('/apps/Music.app/Contents/library/');
            for (const item of ok.items) {
                tk.cb('b4 b2 left', item.name, async function () {
                    stopmusic(); playmusic(item.path, item.name);
                }, div);
            }
            const elements = div.children;
            if (elements.length === 0) return null;
            let go = elements[Math.floor(Math.random() * elements.length)];
            function go2() {
                if (go.innerText !== "Back") {
                    go.click();
                } else {
                    go = elements[Math.floor(Math.random() * elements.length)];
                    go2();
                }
            }
            go2();
            div.remove();
        }
        async function playmusic(path2, name2, ext) {
            audio = await ui.play(path2);
            audio.addEventListener("ended", async function () {
                shuffle();
            });
            nowplaytxt.innerText = ui.truncater(name2, 20);
            const progressBar = tk.c('input', nowplay);
            progressBar.type = "range";
            progressBar.min = 0;
            progressBar.max = 100;
            progressBar.value = 0;
            progressBar.style.width = "100%";

            const playPauseBtn = tk.cb('b4', 'Pause', function () {
                if (audio.paused) {
                    audio.play();
                    playPauseBtn.textContent = "Pause";
                } else {
                    audio.pause();
                    playPauseBtn.textContent = "Play";
                }
            }, nowplay);


            if (ext === true) {
                tk.cb('b4', 'Add', async function () {
                    const ok = await fs.read(path2);
                    fs.write('/apps/Music.app/Contents/library/' + name2, ok);
                    wm.snack('Added to Music library');
                }, nowplay);
            }

            audio.addEventListener("timeupdate", function () {
                progressBar.value = (audio.currentTime / audio.duration) * 100;
            });

            progressBar.addEventListener("input", function () {
                audio.currentTime = (progressBar.value / 100) * audio.duration;
            });

            show(plaything);
        }
        tk.cb('b4 b2 left', 'Music', async function () {
            showm(musicm);
            const div = tk.c('div', musicm);
            tk.cb('b4', 'Back', function () {
                ui.dest(div);
                showm(mainm);
            }, div);
            tk.cb('b4', 'Shuffle', function () {
                shuffle();
            }, div);
            const ok = await fs.ls('/apps/Music.app/Contents/library/');
            for (const item of ok.items) {
                tk.cb('b4 b2 left', item.name, async function () {
                    stopmusic(); playmusic(item.path, item.name);
                }, div);
            }
        }, mainm).addEventListener('mouseover', function () { show(musicthing); });
        tk.cb('b4 b2 left', 'Settings', () => showm(settingsm), mainm).addEventListener('mouseover', function () { show(settingsthing); });
        tk.cb('b4 b2 left', 'Now Playing', () => shuffle(), mainm).addEventListener('mouseover', function () { show(plaything); });

        const musicm = tk.c('div', half1, 'hide');

        const settingsm = tk.c('div', half1, 'hide');
        tk.cb('b4', 'Back', function () {
            showm(mainm);
        }, settingsm);
        tk.cb('b4 b2 left', 'Erase Library', function () {
            const dark = ui.darken();
            const div = tk.c('div', dark, 'cm');
            ui.play('/system/lib/other/error.wav');
            tk.img('/system/lib/img/icons/warn.svg', 'setupi', div, true);
            tk.p('Warning', 'bold', div);
            tk.p(`You're about to erase all of Music's data. This cannot be undone!`, undefined, div);
            tk.cb('b1', 'Erase', function () {
                ui.dest(dark);
                fs.delfold('/apps/Music.app/Contents/library/');
                win.closebtn.click();
                wm.snack('Erase completed');
            }, div);
            tk.cb('b1', 'Close', function () {
                ui.dest(dark);
            }, div);
        }, settingsm);
        tk.cb('b4 b2 left', 'Download Library', async function () {
            const div = tk.c('div', document.body, 'cm');
            tk.p('Compressing', 'bold', div);
            tk.p(`Your library will be downloaded as a .zip, this might take a bit...`, undefined, div);
            tk.cb('b1', 'Close', function () {
                ui.dest(div);
            }, div);
            function base64ToUint8Array(base64) {
                const binaryString = atob(base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes;
            }

            const zip = new JSZip();
            const files = await fs.ls('/apps/Music.app/Contents/library/');

            for (const file of files.items) {
                const base64Data = await fs.read(file.path, { encoding: "utf-8" });
                const match = base64Data.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
                if (!match) continue;

                const mimeType = match[1];
                const base64Content = match[2];
                const binaryData = base64ToUint8Array(base64Content);
                const extension = mimeType.split("/")[1]; // e.g., "mp3", "wav"
                const fileName = file.name.includes(".") ? file.name : `${file.name}.${extension}`;
                zip.file(fileName, binaryData);
            }

            const go2 = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(go2);
            link.download = "music_library.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            ui.dest(div);
        }, settingsm);

        const settingsthing = tk.c('div', half2, 'hide');
        tk.img('/apps/Settings.app/icon.svg', 'setupi', settingsthing);
        tk.p('Settings', 'bold', settingsthing);
        tk.p(`Manage your settings/library`, 'smtxt', settingsthing);
        const plaything = tk.c('div', half2, 'hide');
        tk.img('/apps/Iris.app/icon.svg', 'setupi', plaything);
        tk.p('Now Playing', 'bold', plaything);
        const nowplaytxt = tk.p(`Manage what's playing`, 'smtxt', plaything);
        const nowplay = tk.c('div', plaything);

        const gothing = tk.c('div', half2);
        tk.img('/apps/Music.app/Contents/icon.svg', 'setupi', gothing);
        tk.p('Welcome', 'bold', gothing);
        tk.p('Hover a button to view, click to use', 'smtxt', gothing);

        const musicthing = tk.c('div', half2, 'hide');
        tk.img('/apps/Music.app/Contents/icon.svg', 'setupi', musicthing);
        tk.p('Music', 'bold', musicthing);
        tk.p('Your saved songs/library', 'smtxt', musicthing);

        function show(ok) {
            ui.hide(settingsthing, 0);
            ui.hide(plaything, 0);
            ui.hide(gothing, 0);
            ui.hide(musicthing, 0);
            ui.show(ok, 0);
        }

        function showm(ok) {
            ui.hide(mainm, 0);
            ui.hide(settingsm, 0);
            ui.hide(musicm, 0);
            ui.show(ok, 0);
        }

        win.closebtn.addEventListener('click', function () {
            stopmusic();
        });

        if (path && name) {
            playmusic(path, name, true);
        }
    }
}