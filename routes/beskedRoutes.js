import express from 'express';

import {
    hentBeskeder,
    hentBesked,
    opretBesked
} from '../Controllers/BeskedController.js';

const router = express.Router();

// RESTful API
router.get('/chats/:chatId/messages', hentBeskeder);
router.get('/chats/:chatId/messages/:beskedId', hentBesked);
router.post('/chats/:chatId/messages', opretBesked);

export default router;