import express from 'express';
import {
    visOpretChat,
    hentAlleChats,
    hentChat,
    opretChat,
    redigerChat,
    sletChat
} from '../Controllers/ChatsController.js';

const router = express.Router();

// Pug-sider
router.get('/chats/opret', visOpretChat);

// RESTful API
router.get('/chats', hentAlleChats);
router.get('/chats/:id', hentChat);
router.post('/chats', opretChat);
router.put('/chats/:id', redigerChat);
router.delete('/chats/:id', sletChat);

export default router;