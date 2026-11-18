// BrugerController.js
import fs from 'node:fs';
import { hentAlleDokumenter } from '../services/firestoreService.js';
import { hashPassword, tjekPassword } from '../services/passwordService.js';

// Hent og gem brugere i JSON-filen
export function hentBrugere() {
    const data = fs.readFileSync('./data/Brugerer.json', 'utf8');
    return JSON.parse(data);
}

export function gemBrugere(brugere) {
    fs.writeFileSync(
        './data/Brugerer.json',
        JSON.stringify(brugere, null, 4)
    );
}

// Find den bruger, der er logget ind
export function hentAktuelBruger(req) {
    if (!req.session.brugerId) {
        return null;
    }

    const brugere = hentBrugere();

    return brugere.find(bruger =>
        bruger.id === req.session.brugerId
    ) || null;
}

// Log brugeren ind
export function login(req, res) {
    const brugere = hentBrugere();

    const bruger = brugere.find(bruger =>
        bruger.username === req.body.username &&
        tjekPassword(req.body.password, bruger.password)
    );

    if (!bruger) {
        return res.status(401).send(
            'Forkert brugernavn eller adgangskode'
        );
    }

    req.session.brugerId = bruger.id;
    res.redirect('/chats')
}

// Opret en ny bruger og gem i JSON
export async function opretBruger(req, res) {
    try {
        const brugere = hentBrugere();
        const { username, password, gentagPassword } = req.body;

        if (!username || !password || !gentagPassword) {
            return res.status(400).send('Udfyld alle felter');
        }

        if (password !== gentagPassword) {
            return res.status(400).send('Adgangskoderne er ikke ens');
        }

        const eksisterendeBruger = brugere.find(bruger =>
            bruger.username === username
        );

        if (eksisterendeBruger) {
            return res.status(400).send('Brugernavnet er allerede i brug');
        }

        const nytId = Math.max(
            0,
            ...brugere.map(bruger => Number(bruger.id) || 0)
        ) + 1;

        const nyBruger = {
            id: nytId,
            username,
            password: hashPassword(password),
            oprettelsesdato: new Date().toISOString(),
            niveau: 1
        };

        brugere.push(nyBruger);
        gemBrugere(brugere);
        res.redirect('/');
    } catch (error) {
        console.error('Fejl ved oprettelse af bruger:', error);
        res.status(400).send('Kunne ikke oprette brugeren: ' + error.message);
    }
}

// Ændr brugerniveau
export function aendreBrugerniveau(req, res) {
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
    res.redirect('/users');
}
// GET /users
export function hentAlleBrugere(req, res) {
    const aktuel = hentAktuelBruger(req);

    if (!aktuel) {
        return res.format({
            json: () => res.status(401).json({ fejl: 'Du skal være logget ind' }),
            html: () => res.redirect('/')
        });
    }

    if (aktuel.niveau !== 3) {
        return res.format({
            json: () => res.status(403).json({ fejl: 'Du har ikke adgang' }),
            html: () => res.status(403).send('Du har ikke adgang til denne side.')
        });
    }

    const brugere = hentBrugere().map(({ password, ...bruger }) => bruger);

    res.format({
        json: () => res.json(brugere),
        html: () => res.render('AdministrerBruger', { brugere })
    });
}

// GET /users/:id
export function hentBruger(req, res) {
    const aktuel = hentAktuelBruger(req);

    if (!aktuel) return res.status(401).json({ fejl: 'Du skal være logget ind' });
    if (aktuel.niveau !== 3) return res.status(403).json({ fejl: 'Du har ikke adgang' });

    const fundet = hentBrugere().find(b => b.id === Number(req.params.id));

    if (!fundet) return res.status(404).json({ fejl: 'Brugeren findes ikke' });

    const { password, ...udenPassword } = fundet;
    res.json(udenPassword);
}

// GET /users/:id/messages
export async function hentBrugerBeskeder(req, res) {
    const aktuel = hentAktuelBruger(req);

    if (!aktuel) {
        return res.format({
            json: () => res.status(401).json({ fejl: 'Du skal være logget ind' }),
            html: () => res.redirect('/')
        });
    }

    const id = Number(req.params.id);

    if (!hentBrugere().some(b => b.id === id)) {
        return res.status(404).json({ fejl: 'Brugeren findes ikke' });
    }

    try {
        const chats = await hentAlleDokumenter('chats');

        const beskeder = chats.flatMap(chat =>
            (chat.beskeder || [])
                .filter(besked => Number(besked.ejerId) === id)
                .map(besked => ({ ...besked, chatNavn: chat.navn }))
        );

        const erEgenSide = aktuel.id === id;

        res.format({
            json: () => res.json(beskeder),
            html: () => erEgenSide
                ? res.render('SeDineBeskeder', { beskeder })
                : res.json(beskeder)
        });

    } catch (error) {
        console.error('Fejl ved hentning af brugerens beskeder:', error);
        res.status(500).json({ fejl: 'Kunne ikke hente beskeder' });
    }
}

// Log brugeren ud
export function logout(req, res) {
    req.session.destroy(() => res.redirect('/'));
}