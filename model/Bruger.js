// En ejer består af et 
// id, et brugernavn og et kodeord samt en oprettelsesdato og brugerniveau (1-3)

// == Imports =========================================================
import mongoose from ('mongoose');
const brugerSchema = new mongoose.Schema({
    
})













class Bruger {
    static antalEjere = 0;
    constructor(brugerNavn, kodeord, brugerNiveau) {
        Bruger.antalEjere++;
        this.id = Bruger.antalEjere;
        this.brugerNavn = brugerNavn;
        this.kodeord = kodeord;
        this.brugerNiveau = brugerNiveau;
        this.oprettelsesDato = new Date();
    }
}

// Modtager update fra controller, giver besked til Controller
