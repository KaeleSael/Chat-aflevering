import express from 'express';

import {
    login,
    logout,
    opretBruger,
    aendreBrugerniveau,
    hentAlleBrugere,
    hentBruger, 
    hentBrugerBeskeder
} from '../Controllers/BrugerController.js';

const router = express.Router();

// Login, logout og oprettelse
router.post('/login', login);
router.post('/opretBruger', opretBruger);
router.post('/logout', logout);

//REST
router.get('/users', hentAlleBrugere);
router.get('/users/:id', hentBruger);
router.get('/users/:id/messages', hentBrugerBeskeder);

//administration
router.post('/users/:id/niveau', aendreBrugerniveau);

export default router;