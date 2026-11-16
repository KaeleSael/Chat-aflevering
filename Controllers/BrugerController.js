// skal hente info fra View, sender update til Brugermodel
import { response } from "express";
import { Bruger } from "../model/Bruger";
// modtager besked fra modelbruger, sender Update til view 

export async function opretBruger(req, res) {
    try {
        const { brugernavn, password } = req.body;

        await Bruger.opretBruger(brugernavn, password);

        res.redirect('/login');
    } catch (error) {
        console.error('fejl ved oprettelse af bruger', error);
        res.status(500).send('Kunne ikke oprette brugeren');
    }
}