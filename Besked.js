// En besked består af et: 
// id, en besked, en oprettelsesdato, en ejer og et chattilhørsforhold

class Besked {
    static antalBeskeder = 0;
    constructor(besked, ejer, chatId) {
        Besked.antalBeskeder++ // beskedens eget unikke nummer
        this.id = Besked.antalBeskeder;
        this.besked = besked;
        this.oprettelsesDato = new Date();
        this.ejer = ejer;
        this.chatId = chatId; // id for char besked ligger i -> chattilhørsforhold
    }
}