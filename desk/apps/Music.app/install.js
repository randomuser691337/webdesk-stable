app['music'] = {
    runs: true,
    name: 'Music (beta)',
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
        let currentpath = "/apps/Music.app/Contents/library/";
        let audio;
        function stopmusic() {
            if (audio) {
                audio.pause();
                audio = null;
            }
            nowplay.innerHTML = "";
            nowplaytxt.innerText = "Manage what's playing";
        }
        let tagger = await initscript('/apps/Music.app/Contents/tagger.js');
        async function lyrics(songName, songArtist) {
            // copied DIRECTLY from shuffler
            const searchUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(songArtist)}/${encodeURIComponent(songName)}`;

            try {
                const response = await fetch(searchUrl);

                if (!response.ok) {
                    return "<p>Lyrics not available for this song. Check your Internet connection.</p>"
                }

                const data = await response.json();

                if (!data.lyrics) {
                    return '<p>Lyrics not available for this song.</p>';
                }

                const lyrics = data.lyrics;

                return lyrics;
            } catch (error) {
                console.error(error.message);
                return '<p>Failed to fetch lyrics for this song</p>';
            }
        }
        async function songinfo(base64Content, path) {
            const binaryContent = atob(base64Content.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(binaryContent.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < binaryContent.length; i++) {
                view[i] = binaryContent.charCodeAt(i);
            }

            let mimeType;
            if (path.endsWith('.mp3') || path.endsWith('.mpeg')) {
                mimeType = 'audio/mpeg';
            } else if (path.endsWith('.wav')) {
                mimeType = 'audio/wav';
            } else {
                mimeType = 'audio/mpeg';
            }

            let blob = new Blob([arrayBuffer], { type: mimeType });
            return new Promise((resolve, reject) => {
                jsmediatags.read(blob, {
                    onSuccess: function (tag) {
                        if (tag && tag.tags) {
                            resolve(tag.tags);
                        } else {
                            resolve({ title: 'Unknown', artist: 'Unknown' });
                        }
                    },
                    onError: function (error) {
                        console.error(error);
                        resolve({ title: 'Unknown', artist: 'Unknown' });
                    }
                });
            });
        }
        let playlist = [];
        async function shuffle() {
            if (playlist.length === 0) {
                const ok = await fs.ls(currentpath);
                playlist = ok.items
                    .filter(item => !item.name.endsWith('.folder') || !item.type === "folder")
                    .map(item => ({ path: item.path, name: item.name }));
            }

            if (playlist.length === 0) {
                wm.snack('No songs available to shuffle');
                return;
            }

            const randomIndex = Math.floor(Math.random() * playlist.length);
            const selectedSong = playlist.splice(randomIndex, 1)[0];
            playmusic(selectedSong.path, selectedSong.name);
        }

        function setupMediaSession(audio, metadata) {
            if ('mediaSession' in navigator) {
                let artworkSrc = '';
                if (metadata.picture && metadata.picture.data && metadata.picture.format) {
                    const byteArray = new Uint8Array(metadata.picture.data);
                    const blob = new Blob([byteArray], { type: metadata.picture.format });
                    artworkSrc = URL.createObjectURL(blob);
                }

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: metadata.title || 'Unknown',
                    artist: metadata.artist || 'Unknown',
                    album: metadata.album || 'Unknown',
                    artwork: [
                        { src: artworkSrc, sizes: '512x512', type: metadata.picture?.format || 'image/png' }
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => {
                    if (audio.paused) {
                        audio.play();
                    }
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                    if (!audio.paused) {
                        audio.pause();
                    }
                });

                navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                    audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
                });

                navigator.mediaSession.setActionHandler('seekforward', (details) => {
                    audio.currentTime = Math.min(audio.duration, audio.currentTime + (details.seekOffset || 10));
                });

                navigator.mediaSession.setActionHandler('stop', () => {
                    audio.pause();
                    // audio.currentTime = 0;
                });

                navigator.mediaSession.setActionHandler('seekto', (details) => {
                    if (details.fastSeek && 'fastSeek' in audio) {
                        audio.fastSeek(details.seekTime);
                    } else {
                        audio.currentTime = details.seekTime;
                    }
                });
            }
        }

        async function playmusic(path2, name2, ext) {
            stopmusic();
            const sigma = await fs.read(path2);
            audio = await ui.play(path2, sigma);
            audio.addEventListener("ended", async function () {
                shuffle();
            });

            const progressBar = tk.c('input', nowplay);
            progressBar.type = "range";
            progressBar.min = 0;
            progressBar.max = 100;
            progressBar.value = 0;
            progressBar.style.width = "100%";

            const go = await songinfo(sigma, path2);
            console.log(go);
            nowplaytxt.innerText = ui.truncater(go.title, 18, true);
            lyrics(go.title, go.artist).then(lyr => { console.log(lyr); });

            setupMediaSession(audio, go);

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
                    fs.write(currentpath + name2, sigma);
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

        const mbtn = tk.cb('b4 b2 left', 'Music', async function () {
            showm(musicm);
            const div = tk.c('div', musicm);
            tk.cb('b4', 'Back', function () {
                ui.dest(div);
                showm(mainm);

            }, div);
            tk.cb('b4 hide', 'New playlist', function () {
                const div = tk.c('div', musicm, 'cm');
                tk.p('Create a new playlist', undefined, div);
                const input = tk.c('input', div, 'i1');
                input.placeholder = 'Playlist name';
                tk.cb('b4', 'Close', async function () {
                    ui.dest(div);
                }, div);
                tk.cb('b4', 'Create', async function () {
                    const playlistName = input.value.trim();
                    if (!playlistName) {
                        wm.snack('Playlist name cannot be empty');
                        return;
                    }
                    const path = '/apps/Music.app/Contents/library/' + playlistName;
                    currentpath = path;
                    await fs.write(path + "/.folder", '.folder');
                    wm.snack(`Playlist ${playlistName} created`);
                    console.log(mbtn);
                    mbtn.click();
                    ui.dest(div);
                }, div);
            }, div);
            const ok = await fs.ls(currentpath);
            for (const item of ok.items) {
                if (item.name !== ".folder") {
                    if (item.type === "folder") {
                        tk.cb('b4 b2 left bold', item.name, async function () {
                            currentpath = item.path;
                            mbtn.click();
                        }, div);
                    } else {
                        tk.cb('b4 b2 left', item.name, async function () {
                            stopmusic(); playmusic(item.path, item.name);
                        }, div);
                    }
                }
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
            tk.cb('b1 nodont', 'Erase', function () {
                ui.dest(dark);
                fs.delfold(currentpath);
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
            const files = await fs.ls(currentpath);

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
        tk.img('/apps/Settings.app/Contents/icon.svg', 'setupi', settingsthing);
        tk.p('Settings', 'bold', settingsthing);
        tk.p(`Manage your settings/library`, 'smtxt', settingsthing);
        const plaything = tk.c('div', half2, 'hide');
        tk.img('/apps/Iris.app/Contents/icon.svg', 'setupi', plaything);
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
            stopmusic(); tagger.remove();
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
            navigator.mediaSession.setActionHandler("stop", null);
            navigator.mediaSession.setActionHandler("seekbackward", null);
            navigator.mediaSession.setActionHandler("seekforward", null);
            navigator.mediaSession.setActionHandler("seekto", null);
            navigator.mediaSession.setActionHandler("previoustrack", null);
            navigator.mediaSession.setActionHandler("nexttrack", null);

        });

        if (path && name) {
            playmusic(path, name, true);
        }
    }
}