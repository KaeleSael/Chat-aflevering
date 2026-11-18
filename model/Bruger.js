export class Bruger {

    constructor(brugerNavn, niveau = 1, id = null, oprettelsesDato = new Date()) {
        this.id = id;
        this.brugerNavn = brugerNavn;
        this.oprettelsesDato = oprettelsesDato;
        this.niveau = niveau;
    }
}