// app.js
import express from 'express';
import { opretBruger } from './Controllers/BrugerController.js';
import { Bruger } from './model/Bruger.js';

//for at starte websiden, skal du skrive node app.js i din terminal
//åbn derefter hjemmesiden localhost:8010
const app = express();

app.use(express.static('assets'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('loginSide');
});

app.get('/opretBruger', (req,res)=>{
    res.render('opretBruger');
})

app.post('/opretBruger', opretBruger);

app.post('/login', (req, res) => {
    res.render('BrugerForside', { name: req.body.username });
})

app.post('/nyChat', (req, res) => {
    // kode til at oprette ny chat  
})
app.listen(8010, () => {
    console.log('Serveren kører på port 8010');
});
