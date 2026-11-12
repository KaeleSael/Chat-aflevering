class Chat {
    static antalChats = 0;
    
    constructor(navn, ejer){
        Chat.antalChats++;
        this.id = Chat.antalChats;
        this.navn = navn;
        this.oprettelsesdato = new Date();  
        this.ejer = ejer;
        this.beskeder = [];
    }
}