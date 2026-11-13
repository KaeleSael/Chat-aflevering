// En ejer består af et 
// id, et brugernavn og et kodeord samt en oprettelsesdato og brugerniveau (1-3)

class Ejer {
    static antalEjere = 0;
    constructor(brugerNavn, kodeord, brugerNiveau) {
        Ejer.antalEjere++;
        this.id = Ejer.antalEjere;
        this.brugerNavn = brugerNavn;
        this.kodeord = kodeord;
        this.brugerNiveau = brugerNiveau;
        this.oprettelsesDato = new Date();
    }
}