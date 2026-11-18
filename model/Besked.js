export class Besked {

    constructor(krypteretIndhold, ejerId, chatId, id = null, oprettelsesDato = new Date()) {
        this.id = id;
        this.krypteretIndhold = krypteretIndhold;
        this.oprettelsesDato = oprettelsesDato;
        this.ejerId = ejerId;
        this.chatId = chatId;
    }

    static fraFirestore(id, data) {
        return new Besked(
            data.krypteretIndhold,
            data.ejerId,
            data.chatId,
            id,
            data.oprettelsesDato?.toDate
                ? data.oprettelsesDato.toDate()
                : data.oprettelsesDato
        );
    }

    tilFirestore() {
        return {
            krypteretIndhold: this.krypteretIndhold,
            oprettelsesDato: this.oprettelsesDato,
            ejerId: this.ejerId,
            chatId: this.chatId
        };
    }
}