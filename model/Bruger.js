// En ejer består af et 
// id, et brugernavn og et kodeord samt en oprettelsesdato og brugerniveau (1-3)

// == Imports =========================================================
// import { json } from "express";
import fs from ('node:fs/promises');

const filsti = './data/Brugerer.json';

export class Bruger {
    static unikId = 1;
    constructor(brugerNavn, password) {
        this.brugerNavn = brugerNavn;
        this.password = password;
        this.id = unikId
        unikId++;
    }

    static async hentAlle() {
        try {
            const data = await fs.readFile();
            return JSON.parse(data);
        } catch (error) {
            return []; // retunere tomt array hvis løber ind i fejl
        }
    }

    static async opretBruger(brugerNavn, password) {
        const brugere = await this.hentAlle();
        const nyBruger = new Bruger(brugerNavn, password);
        brugere.push(nyBruger);
        await fs.writefie(filsti, JSON.stringify(brugere, null, 2));

        return nyBruger;
    }
}














// class Bruger {
//     static antalEjere = 0;
//     constructor(brugerNavn, kodeord, brugerNiveau) {
//         Bruger.antalEjere++;
//         this.id = Bruger.antalEjere;
//         this.brugerNavn = brugerNavn;
//         this.kodeord = kodeord;
//         this.brugerNiveau = brugerNiveau;
//         this.oprettelsesDato = new Date();
//     }
// }

// Modtager update fra controller, giver besked til Controller
