// WELCOME TO THE JUNKYARD
// Unused code that might have a use later.

// FILES SEARCHBAR

const search = tk.c('input', win.main, 'i1');
search.placeholder = "Search for any file...";
search.addEventListener('input', function (event) {
    items.innerHTML = "";
    thing.items.forEach(function (thing) {
        if (thing.path.includes(event.target.value)) {
            tk.cb('flist', thing.path, () => console.log(thing.path), items);
        }
    });
}); 

// SelfQNA App

/* selfqna: {
    runs: true,
    name: 'SelfQNA',
    init: async function () {
        const win = tk.mbw('SelfQNA', '380px', 'auto', true, undefined, undefined);
        const main = tk.c('div', win.main, '');
        tk.p(`Searches WebDesk's filesystem for something you ask for, and might return an answer.`, undefined, main);
        const i = tk.c('input', main, 'i1');
        i.placeholder = "Ask your WebDesk a question...";
        let finish;
        const unload = tk.cb('b1', 'Unload model from RAM', async () => {
            sys.model = undefined;
            finish.innerText = "Model unloaded successfully";
            setTimeout(function () { finish.innerText = "Ask your WebDesk a question..."; }, 3000);
        }, main);
        const button = tk.cb('b1', 'Ask!', async () => {
            finish.innerText = "Loading files...";
            try {
                const context = await fs.getall();
                const answer = await ai.find(context, i.value, finish);
                finish.innerText = answer;
            } catch (error) {
                finish.innerText = "Error occurred: " + error.message;
            }
        }, main);
        finish = tk.p('Answers will appear here', undefined, main);
    }
}, */

// Old WebDesk bits

/* function sends(name, file) {
    fname = name;
    fblob = file;
    opapp('sendf');
    masschange('fname', name);
}

function sendf(id) {
    try {
        custf(id, fname, fblob);
        snack('File has been sent.', 2500);
        play('./assets/other/woosh.ogg');
    } catch (error) {
        console.log('<!> Error while sending file:', error);
        snack('An error occurred while sending your file.', 2500);
    }
} */