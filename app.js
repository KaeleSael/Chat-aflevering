import express from 'express';

//for at starte websiden, skal du skrive node app.js i din terminal
//åbn derefter hjemmesiden localhost:8010
const app = express();
app.use(express.static('assets'));


app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('loginSide');
});

app.listen(8010, () => {
    console.log('Serveren kører på port 8010');
});
