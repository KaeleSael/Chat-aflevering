import { hentAktuelBruger, hentBrugere } from './BrugerController.js';
import { dekrypterBesked } from '../services/krypteringService.js';

import {
    hentAlleDokumenter,
    hentDokument,
    opretDokument,
    opdaterDokument,
    sletDokument
} from '../services/firestoreService.js';

const CHAT_COLLECTION = 'chats';

// Returnerer chatten med dekrypterede beskeder
function medDekrypteredeBeskeder(chat) {
    return {
        ...chat,
        beskeder: (chat.beskeder || []).map(besked => ({
            ...besked,
            krypteretIndhold: dekrypterBesked(besked.krypteretIndhold)
        }))
    };
}

// Kontroller om brugeren har adgang til en chat
function harAdgangTilChat(bruger, chat) {
    return chat.medlemmer?.includes(bruger.id) || bruger.niveau === 3;
}

// Kontroller om brugeren må redigere eller slette en chat
function harRedigeringsAdgang(bruger, chat) {
    return bruger.niveau === 3 ||
        (bruger.niveau >= 2 && chat.ejerId === bruger.id);
}

// Hent brugere uden adgangskoder
function hentBrugereUdenPassword() {
    return hentBrugere().map(({ password, ...bruger }) => bruger);
}

// Vis formular til oprettelse af chat
export function visOpretChat(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }
    if (bruger.niveau < 2) {
    return res.status(403).send('Du har ikke adgang til at oprette chats');
    }

    res.render('NyChat', {
        brugere: hentBrugereUdenPassword(),
        brugerId: bruger.id
    });
}

// Vis en bestemt chat
export async function visChat(req, res) {
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.redirect('/');
        }

        const chat = await hentDokument(CHAT_COLLECTION, req.params.id);

        if (!chat) {
            return res.status(404).send('Chatten findes ikke');
        }

        if (!harAdgangTilChat(bruger, chat)) {
            return res.status(403).send('Du har ikke adgang til denne chat');
        }

        const brugere = hentBrugereUdenPassword();

        const chatMedlemmer = chat.medlemmer
            .map(id => brugere.find(bruger => bruger.id === id))
            .filter(Boolean);

        const muligeMedlemmer = brugere.filter(bruger =>
            !chat.medlemmer.includes(bruger.id)
        );

        res.render('Chat', {
            chat: medDekrypteredeBeskeder(chat),
            brugerId: bruger.id,
            brugerNiveau: bruger.niveau,
            chatMedlemmer,
            muligeMedlemmer
        });

    } catch (error) {
        console.error('Fejl ved visning af chat:', error);
        res.status(500).send('Kunne ikke hente chatten');
    }
}

// REST: Hent alle chats
export async function hentAlleChats(req, res) {
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.format({
                json: () => res.status(401).json({ fejl: 'Du skal være logget ind' }),
                html: () => res.redirect('/')
            });
        }

        const alleChats = await hentAlleDokumenter(CHAT_COLLECTION);

        const brugerChats = alleChats.filter(chat =>
            harAdgangTilChat(bruger, chat)
        );

        res.format({
            json: () => res.json(brugerChats.map(medDekrypteredeBeskeder)),
            html: () => res.render('BrugerForside', {
                chats: brugerChats,
                brugerNiveau: bruger.niveau,
                brugerId: bruger.id
            })
        });

    } catch (error) {
        console.error('Fejl ved hentning af chats:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente chats' });
    }
}

// REST: Hent en bestemt chat
export async function hentChat(req, res) {
     // Browseren vil have HTML, fetch vil have JSON
    if (req.accepts(['json', 'html']) === 'html') {
        return visChat(req, res);
    }
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.status(401).json({ fejl: 'Du skal være logget ind' });
        }

        const chat = await hentDokument(CHAT_COLLECTION, req.params.id);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harAdgangTilChat(bruger, chat)) {
            return res.status(403).json({ fejl: 'Du har ikke adgang til denne chat' });
        }

        res.json(medDekrypteredeBeskeder(chat));

    } catch (error) {
        console.error('Fejl ved hentning af chat:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente chatten' });
    }
}

// REST: Opret en ny chat
export async function opretChat(req, res) {
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.status(401).json({ fejl: 'Du skal være logget ind' });
        }
        if (bruger.niveau < 2) {
        return res.status(403).json({ fejl: 'Du har ikke adgang til at oprette chats' });
        }

        const navn = String(req.body.navn || '').trim();

        if (!navn || navn.length > 50) {
            return res.status(400).json({
                fejl: 'Chatnavnet skal være mellem 1 og 50 tegn'
            });
        }

        const medlemmerInput = req.body.medlemmer || [];

        const medlemmer = Array.isArray(medlemmerInput)
            ? medlemmerInput.map(Number)
            : [Number(medlemmerInput)];

        const brugere = hentBrugere();
        const brugerIds = new Set(brugere.map(b => b.id));

        if (medlemmer.some(id => !Number.isInteger(id) || !brugerIds.has(id))) {
            return res.status(400).json({
                fejl: 'En eller flere brugere findes ikke'
            });
        }

        if (!medlemmer.includes(bruger.id)) {
            medlemmer.push(bruger.id);
        }

        const nyChat = {
            navn,
            ejerId: bruger.id,
            ejerNavn: bruger.username,
            medlemmer,
            beskeder: [],
            oprettelsesdato: new Date()
        };

        const id = await opretDokument(CHAT_COLLECTION, nyChat);

        res.status(201).json({
            besked: 'Chatten blev oprettet',
            id
        });

    } catch (error) {
        console.error('Fejl ved oprettelse af chat:', error);
        res.status(500).json({ fejl: 'Kunne ikke oprette chatten' });
    }
}

// REST: Rediger en eksisterende chat
export async function redigerChat(req, res) {
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.status(401).json({ fejl: 'Du skal være logget ind' });
        }

        const chat = await hentDokument(CHAT_COLLECTION, req.params.id);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harRedigeringsAdgang(bruger, chat)) {
            return res.status(403).json({
                fejl: 'Du har ikke tilladelse til at redigere chatten'
            });
        }

        const nytNavn = String(req.body.navn || '').trim();

        if (!nytNavn || nytNavn.length > 50) {
            return res.status(400).json({
                fejl: 'Chatnavnet skal være mellem 1 og 50 tegn'
            });
        }

        const tilArray = værdi => {
            if (værdi === undefined) return [];
            return Array.isArray(værdi) ? værdi : [værdi];
        };

        const fjernIds = tilArray(req.body.fjernMedlemmer).map(Number);
        const tilfoejIds = tilArray(req.body.tilfoejMedlemmer).map(Number);

        const brugere = hentBrugere();
        const brugerIds = new Set(brugere.map(b => b.id));

        if (
            [...fjernIds, ...tilfoejIds].some(
                id => !Number.isInteger(id) || !brugerIds.has(id)
            )
        ) {
            return res.status(400).json({
                fejl: 'En eller flere brugere findes ikke'
            });
        }

        // Ejeren skal altid forblive medlem
        if (fjernIds.includes(chat.ejerId)) {
            return res.status(400).json({
                fejl: 'Chatten ejer skal forblive medlem'
            });
        }

        let medlemmer = chat.medlemmer.filter(id => !fjernIds.includes(id));

        tilfoejIds.forEach(id => {
            if (!medlemmer.includes(id)) {
                medlemmer.push(id);
            }
        });

        await opdaterDokument(CHAT_COLLECTION, req.params.id, {
            navn: nytNavn,
            medlemmer
        });

        res.json({
            besked: 'Chatten blev opdateret'
        });

    } catch (error) {
        console.error('Fejl ved redigering af chat:', error);
        res.status(500).json({ fejl: 'Kunne ikke redigere chatten' });
    }
}

// REST: Slet en chat
export async function sletChat(req, res) {
    try {
        const bruger = hentAktuelBruger(req);

        if (!bruger) {
            return res.status(401).json({ fejl: 'Du skal være logget ind' });
        }

        const chat = await hentDokument(CHAT_COLLECTION, req.params.id);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harRedigeringsAdgang(bruger, chat)) {
            return res.status(403).json({
                fejl: 'Du har ikke tilladelse til at slette chatten'
            });
        }

        await sletDokument(CHAT_COLLECTION, req.params.id);

        res.json({
            besked: 'Chatten blev slettet'
        });

    } catch (error) {
        console.error('Fejl ved sletning af chat:', error);
        res.status(500).json({ fejl: 'Kunne ikke slette chatten' });
    }
}