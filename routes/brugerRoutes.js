
import express from 'express';

import {
    login,
    logout,
    opretBruger,
    visBrugere,
    aendreBrugerniveau,
    hentAlleBrugere,
    hentBruger, 
    hentBrugerBeskeder
} from '../Controllers/BrugerController.js';

const router = express.Router();

// Pug-sider
router.get('/brugere', visBrugere);

// Login, logout og oprettelse
router.post('/login', login);
router.post('/opretBruger', opretBruger);
router.post('/logout', logout);

//REST
router.get('/users', hentAlleBrugere);
router.get('/users/:id', hentBruger);
router.get('/users/:id/messages', hentBrugerBeskeder);

//administration
router.post('/brugere/:id/niveau', aendreBrugerniveau);


export default router;
