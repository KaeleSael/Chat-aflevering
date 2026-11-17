// ChatsController.js
import { hentAktuelBruger, hentBrugere } from './BrugerController.js';

// Midlertidige testdata for chats
export const chats = [
    {
        id: 1,
        navn: 'Gaming',
        ejerId: 10,
        ejerNavn: 'Minik',
        medlemmer: [10, 11],
        beskeder: [
            {
                id: 1,
                tekst: 'Hej alle!',
                ejerId: 10,
                ejerNavn: 'Minik',
                dato: '16-11-2026'
            },
            {
                id: 2,
                tekst: 'Hej!',
                ejerId: 11,
                ejerNavn: 'Kasper',
                dato: '16-11-2026'
            }
        ]
    },
    {
        id: 2,
        navn: 'Skoleprojekt',
        ejerId: 11,
        ejerNavn: 'Kasper',
        medlemmer: [10, 11],
        beskeder: [
            {
                id: 3,
                tekst: 'Hvordan går projektet?',
                ejerId: 10,
                ejerNavn: 'Minik',
                dato: '16-11-2026'
            }
        ]
    }
];

// Vis formular til oprettelse af chat
export function visOpretChat(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);

    res.render('NyChat', {
        brugere,
        brugerId: bruger.id
    });
}

// Åbn en bestemt chat
export function visChat(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const chat = chats.find(chat => chat.id === Number(req.params.id));

    if (!chat) {
        return res.status(404).send('Chatten findes ikke');
    }

    if (!chat.medlemmer.includes(bruger.id)) {
        return res.status(403).send('Du har ikke adgang til denne chat');
    }

    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);
    const chatMedlemmer = chat.medlemmer
        .map(id => brugere.find(bruger => bruger.id === id))
        .filter(Boolean);
    const muligeMedlemmer = brugere.filter(bruger =>
        !chat.medlemmer.includes(bruger.id)
    );

    res.render('Chat', {
        chat,
        brugerId: bruger.id,
        brugerNiveau: bruger.niveau,
        chatMedlemmer,
        muligeMedlemmer
    });
}

// Rediger chat
export function redigerChat(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    const chat = chats.find(chat => chat.id === Number(req.params.id));

    if (!chat) {
        return res.status(404).send('Chatten findes ikke');
    }

    const harTilladelse =
        bruger.niveau === 3 ||
        (bruger.niveau >= 2 && chat.ejerId === bruger.id);

    if (!harTilladelse) {
        return res.status(403).send('Du har ikke tilladelse til at redigere chatten');
    }

    const nytNavn = String(req.body.navn || '').trim();

    if (!nytNavn || nytNavn.length > 50) {
        return res.status(400).send('Chatnavnet skal være mellem 1 og 50 tegn');
    }

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
    const brugerIds = new Set(brugere.map(bruger => bruger.id));

    if (tilfoejIds.some(id => !brugerIds.has(id))) {
        return res.status(400).send('En eller flere brugere findes ikke');
    }

    chat.navn = nytNavn;
    chat.medlemmer = chat.medlemmer.filter(id => !fjernIds.includes(id));

    tilfoejIds.forEach(id => {
        if (!chat.medlemmer.includes(id)) {
            chat.medlemmer.push(id);
        }
    });

    if (!chat.medlemmer.includes(bruger.id)) {
        return res.redirect('/forside');
    }

    res.redirect('/chats/' + chat.id);
}
