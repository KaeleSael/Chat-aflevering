
const redigerChatDialog = document.getElementById('redigerChatDialog');
const aabnRedigerChat = document.getElementById('aabnRedigerChat');

if (redigerChatDialog && aabnRedigerChat) {

    // Åbn popup'en
    aabnRedigerChat.addEventListener('click', () => {
        redigerChatDialog.showModal();
        aabnRedigerChat.closest('details')?.removeAttribute('open');
    });

    // Luk popup'en med knapperne
    const lukKnapper = redigerChatDialog.querySelectorAll('[data-luk-dialog]');

    lukKnapper.forEach(knap => {
        knap.addEventListener('click', () => {
            redigerChatDialog.close();
        });
    });

    // Luk popup'en ved klik uden for selve vinduet
    redigerChatDialog.addEventListener('click', event => {
        if (event.target === redigerChatDialog) {
            redigerChatDialog.close();
        }
    });
}
