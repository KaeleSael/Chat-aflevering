import { randomUUID } from 'node:crypto';
import { hentAktuelBruger } from './BrugerController.js';
import { hentDokument, opdaterDokument } from '../services/firestoreService.js';
import { Besked } from '../model/Besked.js';

import { krypterBesked, dekrypterBesked } from '../services/krypteringService.js';
import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const CHAT_COLLECTION = 'chats';

// Kontrollerer om brugeren har adgang til chatten
function harAdgangTilChat(bruger, chat) {
    return chat.medlemmer?.some(
        medlemId => String(medlemId) === String(bruger.id)
    ) || bruger.niveau === 3;
}

// Hent alle beskeder i en bestemt chat
export async function hentBeskeder(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.status(401).json({ fejl: 'Du skal være logget ind' });
    }

    try {
        const chat = await hentDokument(CHAT_COLLECTION, req.params.chatId);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harAdgangTilChat(bruger, chat)) {
            return res.status(403).json({ fejl: 'Du har ikke adgang til chatten' });
        }

        res.json(chat.beskeder || []);

    } catch (error) {
        console.error('Fejl ved hentning af beskeder:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente beskeder' });
    }
}

// Hent en bestemt besked i en chat
export async function hentBesked(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.status(401).json({ fejl: 'Du skal være logget ind' });
    }

    try {
        const chat = await hentDokument(CHAT_COLLECTION, req.params.chatId);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harAdgangTilChat(bruger, chat)) {
            return res.status(403).json({ fejl: 'Du har ikke adgang til chatten' });
        }

        const besked = (chat.beskeder || []).find(
            besked => besked.id === req.params.beskedId
        );

        if (!besked) {
            return res.status(404).json({ fejl: 'Beskeden findes ikke' });
        }

        res.json(besked);

    } catch (error) {
        console.error('Fejl ved hentning af besked:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente beskeden' });
    }
}

// Opret en ny besked i en chat
export async function opretBesked(req, res) {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.status(401).json({ fejl: 'Du skal være logget ind' });
    }

    try {
        const chatId = req.params.chatId;
        const chat = await hentDokument(CHAT_COLLECTION, chatId);

        if (!chat) {
            return res.status(404).json({ fejl: 'Chatten findes ikke' });
        }

        if (!harAdgangTilChat(bruger, chat)) {
            return res.status(403).json({ fejl: 'Du har ikke adgang til chatten' });
        }

        const indhold = req.body.besked;

        if (typeof indhold !== 'string' || !indhold.trim()) {
            return res.status(400).json({ fejl: 'Beskeden må ikke være tom' });
        }

        const nyBesked = new Besked(
            indhold.trim(),
            bruger.id,
            chatId,
            randomUUID()
        );

        const beskeder = chat.beskeder || [];

        const gemtBesked = {
            id: nyBesked.id,
            ...nyBesked.tilFirestore(),
            oprettelsesDato: new Date().toISOString(),
            ejerNavn: bruger.username
        };

        beskeder.push(gemtBesked);

        await opdaterDokument(CHAT_COLLECTION, chatId, {
            beskeder
        });

        res.status(201).json({
            besked: 'Beskeden blev oprettet',
            nyBesked: gemtBesked
        });

    } catch (error) {
        console.error('Fejl ved oprettelse af besked:', error);
        res.status(500).json({ fejl: 'Kunne ikke oprette beskeden' });
    }
}

// bruges til at sende krypteret besked
export async function sendBesked(req, res) {
    const { text, afsender } = req.body;

    //Kryptere tekst med den opffentlige nøgle
    const hemmeligTekst = krypterBesked(text);

    //Gemmer krypterede tekst i Firetore
    await addDoc(collection(db, 'beskeder'), {
        afsender: afsender,
        text: hemmeligTekst,
        oprettet: new Date(),
    });

    res.status(201).send('Besked krypteret og gemt i Firestore');
}

// Bruges til at modtage og dekryptere beskede
export async function hentBesked(req, res) {
    const querySnapshot = await getDocs(collection(db, 'beskeder'));

    const beskeder = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Dekrypter teksten tilbage til almindelig læsbar tekst
        const laesbarTekst = dekrypterBesked(data.tekst);

        beskeder.push({
            id: doc.id,
            afsender: data.afsender,
            tekst: laesbarTekst
        });
    });
    
    res.json(beskeder);
}


