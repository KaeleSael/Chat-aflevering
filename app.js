// app.js
import express from 'express';
import session from 'express-session';
import {
    aendreBrugerniveau,
    hentAktuelBruger,
    login,
    opretBruger,
    visBrugere
} from './Controllers/BrugerController.js';
import {
    chats,
    redigerChat,
    visChat,
    visOpretChat
} from './Controllers/ChatsController.js';
import { visBeskeder } from './Controllers/BeskedController.js';

const app = express();
app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'min-hemmelige-noegle',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 time
    }
}));

app.set('view engine', 'pug');

// Login og oprettelse
app.get('/', (req, res) => {
    res.render('loginSide');
});

app.get('/opretBruger', (req, res) => {
    res.render('OpretBruger');
});

app.post('/opretBruger', opretBruger);
app.post('/login', login);

// Brugerforside
app.get('/forside', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    res.render('BrugerForside', {
        chats: chats.filter(chat => chat.medlemmer.includes(bruger.id)),
        brugerNiveau: bruger.niveau
    });
});

// Chats
app.get('/chats/opret', visOpretChat);

app.post('/chats', (req, res) => {
    const bruger = hentAktuelBruger(req);

    if (!bruger) {
        return res.redirect('/');
    }

    res.send('Her skal vi senere oprette en ny chat.');
});

app.get('/chats/:id', visChat);
app.post('/chats/:id/rediger', redigerChat);

// Beskeder
app.get('/beskeder', visBeskeder);

// Brugeradministration
app.get('/brugere', visBrugere);
app.post('/brugere/:id/niveau', aendreBrugerniveau);

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Kunne ikke logge ud');
        }

        res.redirect('/');
    });
});

app.listen(8010, () => {
    console.log('Serveren kører på port 8010');
});
