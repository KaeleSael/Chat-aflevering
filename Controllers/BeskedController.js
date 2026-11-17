// BeskedController.js
import { hentAktuelBruger } from './BrugerController.js';
import { chats } from './ChatsController.js';

// Vis den indloggede brugers beskeder
export function visBeskeder(req, res) {
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

    res.render('SeDineBeskeder', { beskeder });
}
