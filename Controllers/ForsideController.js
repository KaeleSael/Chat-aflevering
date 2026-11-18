import { hentAktuelBruger } from './BrugerController.js';
import { hentAlleDokumenter } from '../services/firestoreService.js';

export function visLogin(req, res) {
    res.render('loginSide');
}

export function visOpretBruger(req, res) {
    res.render('OpretBruger');
}

export async function visForside(req, res) {
    const bruger = hentAktuelBruger(req);
    if (!bruger) return res.redirect('/');

    try {
        const chats = await hentAlleDokumenter('chats');

        res.render('BrugerForside', {
            chats: chats.filter(chat => chat.medlemmer.includes(bruger.id)),
            brugerNiveau: bruger.niveau
        });
    } catch (error) {
        console.error('Fejl ved hentning af chats:', error);
        res.status(500).send('Kunne ikke hente dine chats');
    }
}