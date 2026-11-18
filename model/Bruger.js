
export class Bruger {

    constructor(brugerNavn, niveau = 1, id = null, oprettelsesDato = new Date()) {
        this.id = id;
        this.brugerNavn = brugerNavn;
        this.oprettelsesDato = oprettelsesDato;
        this.niveau = niveau;
    }

    static fraFirestore(id, data) {
        return new Bruger(
            data.brugerNavn,
            data.niveau,
            id,
            data.oprettelsesDato?.toDate
                ? data.oprettelsesDato.toDate()
                : data.oprettelsesDato
        );
    }

    tilFirestore() {
        return {
            brugerNavn: this.brugerNavn,
            oprettelsesDato: this.oprettelsesDato,
            niveau: this.niveau
        };
    }
}
