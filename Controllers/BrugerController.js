// BrugerController.js
// skal hente info fra View, sender update til Brugermodel
import { Bruger } from "../model/Bruger.js";
// modtager besked fra modelbruger, sender Update til view 

export async function opretBruger(req, res) {
    try {
        const { username, password, gentagPassword } = req.body;
        if (password != gentagPassword){
                return res.status(400).send('Adgangskode matcher ikke!')
        }

        await Bruger.opretBruger(username, password);

        res.redirect('/');
    } catch (error) {
        console.error('fejl ved oprettelse af bruger', error);
        res.status(500).send('Kunne ikke oprette brugeren');
    }
}