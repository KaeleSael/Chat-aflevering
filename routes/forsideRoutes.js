import express from 'express';
import { visLogin, visOpretBruger } from '../Controllers/ForsideController.js';

const router = express.Router();

//Pug-sider
router.get('/', visLogin);
router.get('/opretBruger', visOpretBruger);

export default router;