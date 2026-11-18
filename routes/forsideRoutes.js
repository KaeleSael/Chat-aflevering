import express from 'express';
import { visLogin, visOpretBruger, visForside } from '../Controllers/ForsideController.js';

const router = express.Router();

router.get('/', visLogin);
router.get('/opretBruger', visOpretBruger);
router.get('/forside', visForside);

export default router;