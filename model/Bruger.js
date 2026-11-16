// Bruger.js
// == Imports =========================================================
// import { json } from "express";
import fs from 'node:fs/promises';

const filsti = './data/Brugerer.json';

export class Bruger {
    static unikId = 1;
    constructor(brugerNavn, password) {
        this.brugerNavn = brugerNavn;
        this.password = password;
        this.id = Bruger.unikId++;
    }

    static async hentAlle() {
        try {
            const data = await fs.readFile(filsti, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return []; // retunere tomt array hvis løber ind i fejl
        }
    }

    static async opretBruger(brugerNavn, password) {
        const brugere = await this.hentAlle();

        const findesAllerede = brugere.some(b=>b.brugerNavn === brugerNavn);
        if (findesAllerede){
            throw new Error('Brugernavnet er allerede optaget');
        }

        const nyBruger = new Bruger(brugerNavn, password);
        brugere.push(nyBruger);

        await fs.writeFile(filsti, JSON.stringify(brugere, null, 2));

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
