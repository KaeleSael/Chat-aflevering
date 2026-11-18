
export class Chat {

    constructor(navn, ejerId, medlemmer = [], id = null, oprettelsesDato = new Date()) {
        this.id = id;
        this.navn = navn;
        this.oprettelsesDato = oprettelsesDato;
        this.ejerId = ejerId;
        this.medlemmer = medlemmer;
        this.beskeder = [];
    }

    static fraFirestore(id, data) {
        return new Chat(
            data.navn,
            data.ejerId,
            data.medlemmer || [],
            id,
            data.oprettelsesDato?.toDate
                ? data.oprettelsesDato.toDate()
                : data.oprettelsesDato
        );
    }

    tilFirestore() {
        return {
            navn: this.navn,
            oprettelsesDato: this.oprettelsesDato,
            ejerId: this.ejerId,
            medlemmer: this.medlemmer
        };
    }
}
