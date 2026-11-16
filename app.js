// app.js
import express from 'express';
import fs from 'node:fs';
import session from 'express-session';
import { opretBruger } from './Controllers/BrugerController.js';
import { Bruger } from './model/Bruger.js';

const app = express();
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));

// Session opsætning
app.use(session({
    secret: 'min-hemmelige-noegle',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 time
    }
}));

app.set('view engine', 'pug');


// ================================================================
// BRUGERFUNKTIONER
// ================================================================

// Hent alle brugere fra JSON-filen
function hentBrugere() {
    const data = fs.readFileSync('./data/brugere.json', 'utf8');
    return JSON.parse(data);
}

// Gem alle brugere i JSON-filen
function gemBrugere(brugere) {
    fs.writeFileSync(
        './data/brugere.json',
        JSON.stringify(brugere, null, 4)
    );
}

// Find den bruger, der er logget ind
function hentAktuelBruger(req) {
    if (!req.session.brugerId) {
        return null;
    }

    const brugere = hentBrugere();

    return brugere.find(bruger =>
        bruger.id === req.session.brugerId
    ) || null;
}


// ================================================================
// MIDLERTIDIGE TESTDATA - CHATS
// ================================================================

const chats = [
    {
        id: 1,
        navn: "Gaming",
        ejerId: 10,
        ejerNavn: "Minik",
        medlemmer: [10, 11],
        beskeder: [
            {
                id: 1,
                tekst: "Hej alle!",
                ejerId: 10,
                ejerNavn: "Minik",
                dato: "16-11-2026"
            },
            {
                id: 2,
                tekst: "Hej!",
                ejerId: 11,
                ejerNavn: "Kasper",
                dato: "16-11-2026"
            }
        ]
    },
    {
        id: 2,
        navn: "Skoleprojekt",
        ejerId: 11,
        ejerNavn: "Kasper",
        medlemmer: [10, 11],
        beskeder: [
            {
                id: 3,
                tekst: "Hvordan går projektet?",
                ejerId: 10,
                ejerNavn: "Minik",
                dato: "16-11-2026"
            }
        ]
    }
];


// ================================================================
// LOGIN OG OPRETTELSE
// ================================================================

// Vis login
app.get('/', (req, res) => {
    res.render('loginSide');
});

app.get('/opretBruger', (req,res)=>{
    res.render('opretBruger');
})

app.post('/opretBruger', opretBruger);

app.post('/login', (req, res) => {
    const brugere = hentBrugere();

    const bruger = brugere.find(bruger =>
        bruger.username === req.body.username &&
        bruger.password === req.body.password
    );

    if (!bruger) {
        return res.status(401).send(
            'Forkert brugernavn eller adgangskode'
        );
    }

    // Gem brugerens ID i sessionen
    req.session.brugerId = bruger.id;

    res.redirect('/forside');
});

// Vis formular til oprettelse af bruger
app.get('/opretBruger', (req, res) => {
    res.render('OpretBruger');
});

// Opret en ny bruger og gem i JSON
app.post('/opretBruger', (req, res) => {
    const brugere = hentBrugere();

    const { username, password, gentagPassword } = req.body;

    // Kontroller at felterne er udfyldt
    if (!username || !password || !gentagPassword) {
        return res.status(400).send('Udfyld alle felter');
    }

    // Kontroller at adgangskoderne er ens
    if (password !== gentagPassword) {
        return res.status(400).send('Adgangskoderne er ikke ens');
    }

    // Kontroller om brugernavnet allerede findes
    const eksisterendeBruger = brugere.find(bruger =>
        bruger.username === username
    );

    if (eksisterendeBruger) {
        return res.status(400).send('Brugernavnet er allerede i brug');
    }

    // Find næste ledige ID
    const nytId = Math.max(
        0,
        ...brugere.map(bruger => Number(bruger.id) || 0)
    ) + 1;

    // Opret den nye bruger
    const nyBruger = {
        id: nytId,
        username: username,
        password: password,
        oprettelsesdato: new Date().toISOString(),
        niveau: 1
    };

    // Tilføj brugeren til listen
    brugere.push(nyBruger);

    // Gem listen i JSON-filen
    gemBrugere(brugere);

    res.redirect('/');
});


// ================================================================
// BRUGERFORSIDE
// ================================================================

app.get('/forside', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    res.render('BrugerForside', {
        chats: chats.filter(chat =>
            chat.medlemmer.includes(bruger.id)
        ),
        brugerNiveau: bruger.niveau
    });
});


// ================================================================
// CHATS
// ================================================================

app.get('/chats/opret', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);

    res.render('NyChat', {
        brugere: brugere,
        brugerId: bruger.id
    });
});

// Opret chat
app.post('/chats', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    res.send('Her skal vi senere oprette en ny chat.');
});

// Åbn en bestemt chat
app.get('/chats/:id', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const chat = chats.find(chat =>
        chat.id === Number(req.params.id)
    );

    if (!chat) {
        return res.status(404).send('Chatten findes ikke');
    }

    // Kontroller at brugeren er medlem af chatten
    if (!chat.medlemmer.includes(bruger.id)) {
        return res.status(403).send('Du har ikke adgang til denne chat');
    }

    // Hent brugere uden adgangskoder
    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);

    // Find de nuværende medlemmer
    const chatMedlemmer = chat.medlemmer
    .map(id => brugere.find(bruger => bruger.id === id))
    .filter(Boolean);

    // Find brugere, der endnu ikke er medlemmer
    const muligeMedlemmer = brugere.filter(bruger =>
    !chat.medlemmer.includes(bruger.id)
);

    res.render('Chat', {
        chat: chat,
        brugerId: bruger.id,
        brugerNiveau: bruger.niveau,
        chatMedlemmer: chatMedlemmer,
        muligeMedlemmer: muligeMedlemmer
    });
});


// Rediger chat
app.post('/chats/:id/rediger', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const chat = chats.find(chat =>
        chat.id === Number(req.params.id)
    );

    if (!chat) {
        return res.status(404).send('Chatten findes ikke');
    }

    // Kontroller brugerens rettigheder
    const harTilladelse =
        bruger.niveau === 3 ||
        (bruger.niveau >= 2 && chat.ejerId === bruger.id);

    if (!harTilladelse) {
        return res.status(403).send('Du har ikke tilladelse til at redigere chatten');
    }

    // Kontroller chatnavnet
    const nytNavn = String(req.body.navn || '').trim();

    if (!nytNavn || nytNavn.length > 50) {
        return res.status(400).send('Chatnavnet skal være mellem 1 og 50 tegn');
    }

    // Gør værdierne til arrays, også hvis kun én bruger er valgt
    const tilArray = værdi => {
        if (værdi === undefined) return [];
        return Array.isArray(værdi) ? værdi : [værdi];
    };

    const fjernIds = tilArray(req.body.fjernMedlemmer)
        .map(Number)
        .filter(Number.isInteger);

    const tilfoejIds = tilArray(req.body.tilfoejMedlemmer)
        .map(Number)
        .filter(Number.isInteger);

    const brugere = hentBrugere();

    // Kontroller at alle brugere, der tilføjes, findes
    const brugerIds = new Set(brugere.map(bruger => bruger.id));

    if (tilfoejIds.some(id => !brugerIds.has(id))) {
        return res.status(400).send('En eller flere brugere findes ikke');
    }

    // Opdater chatnavnet
    chat.navn = nytNavn;

    // Fjern valgte medlemmer
    chat.medlemmer = chat.medlemmer.filter(id =>
        !fjernIds.includes(id)
    );

    // Tilføj nye medlemmer uden at lave dubletter
    tilfoejIds.forEach(id => {
        if (!chat.medlemmer.includes(id)) {
            chat.medlemmer.push(id);
        }
    });

    // Hvis brugeren har fjernet sig selv, skal vedkommende tilbage til forsiden
    if (!chat.medlemmer.includes(bruger.id)) {
        return res.redirect('/forside');
    }

    res.redirect('/chats/' + chat.id);
});



// ================================================================
// BESKEDER
// ================================================================

app.get('/beskeder', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const beskeder = chats.flatMap(chat =>
        chat.beskeder
            .filter(besked => besked.ejerId === bruger.id)
            .map(besked => ({
                ...besked,
                chatNavn: chat.navn
            }))
    );

    res.render('SeDineBeskeder', {
        beskeder: beskeder
    });
});


// ================================================================
// ADMINISTRER BRUGERE
// ================================================================

app.get('/brugere', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    // Kun niveau 3 må administrere brugere
    if (bruger.niveau !== 3) {
        return res.status(403).send(
            'Du har ikke adgang til denne side.'
        );
    }

    // Hent brugere uden at sende adgangskoder til Pug
    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);

    res.render('AdministrerBruger', {
        brugere: brugere
    });
});

// Ændr brugerniveau
app.post('/brugere/:id/niveau', (req, res) => {
    const aktuelBruger = hentAktuelBruger(req);

    if (!aktuelBruger) {
        return res.redirect('/');
    }

    if (aktuelBruger.niveau !== 3) {
        return res.status(403).send('Du har ikke adgang');
    }

    const brugere = hentBrugere();

    const bruger = brugere.find(bruger =>
        bruger.id === Number(req.params.id)
    );

    if (!bruger) {
        return res.status(404).send('Brugeren findes ikke');
    }

    const nytNiveau = Number(req.body.niveau);

    if (![1, 2, 3].includes(nytNiveau)) {
        return res.status(400).send('Ugyldigt brugerniveau');
    }

    bruger.niveau = nytNiveau;

    gemBrugere(brugere);

    res.redirect('/brugere');
});


// ================================================================
// LOGOUT
// ================================================================

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Kunne ikke logge ud');
        }

        res.redirect('/');
    });
});


// ================================================================
// START SERVER
// ================================================================

app.listen(8010, () => {
    console.log('Serveren kører på port 8010');
});
