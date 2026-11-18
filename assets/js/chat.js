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

const nyBeskedForm = document.getElementById('nyBeskedForm');
const beskedListe = document.getElementById('beskedListe');
const beskedTekst = document.getElementById('beskedTekst');

if (nyBeskedForm && beskedListe && beskedTekst) {
    nyBeskedForm.addEventListener('submit', async event => {
        event.preventDefault();

        const tekst = beskedTekst.value.trim();

        if (!tekst) return;

        try {
            const response = await fetch(nyBeskedForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ besked: tekst })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.fejl || 'Kunne ikke sende beskeden');
                return;
            }

            beskedTekst.value = '';

            const ingenBeskeder = beskedListe.querySelector('.IngenBeskeder');
            if (ingenBeskeder) {
                ingenBeskeder.remove();
            }

            const beskedElement = document.createElement('div');
            beskedElement.classList.add('Besked', 'MinBesked');

            const indhold = document.createElement('p');
            indhold.textContent = data.nyBesked.krypteretIndhold;

            const dato = document.createElement('small');
            dato.textContent = new Date(
                data.nyBesked.oprettelsesDato
            ).toLocaleString('da-DK', { dateStyle: 'short', timeStyle: 'short' });

            beskedElement.append(indhold, dato);
            beskedListe.appendChild(beskedElement);

        } catch (error) {
            console.error('Fejl ved afsendelse af besked:', error);
            alert('Der opstod en fejl ved afsendelse af beskeden');
        }
    });
}

if (beskedListe) {

    const chatId = beskedListe.dataset.chatId;
    const brugerId = beskedListe.dataset.brugerId;

    // Konverter Firestore-timestamps til datoer
    function formaterDato(dato) {
        if (dato?.seconds) {
            dato = new Date(dato.seconds * 1000);
        } else {
            dato = new Date(dato);
        }

        return dato.toLocaleString('da-DK', { dateStyle: 'short', timeStyle: 'short' });
    }

    // Hent og vis beskeder fra serveren
    async function opdaterBeskeder() {
        try {
            const response = await fetch(
                `/chats/${chatId}/messages`
            );

            if (!response.ok) {
                throw new Error('Kunne ikke hente beskeder');
            }

            const beskeder = await response.json();

            // Ryd den nuværende beskedliste
            beskedListe.innerHTML = '';

            if (beskeder.length === 0) {
                const tomListe = document.createElement('p');
                tomListe.classList.add('IngenBeskeder');
                tomListe.textContent = 'Der er endnu ingen beskeder.';
                beskedListe.appendChild(tomListe);
                return;
            }

            // Gennemgå alle beskeder
            beskeder.forEach(besked => {

                const erEgenBesked =
                    String(besked.ejerId) === String(brugerId);

                const beskedElement = document.createElement('div');

                beskedElement.classList.add(
                    'Besked',
                    erEgenBesked ? 'MinBesked' : 'AndreBesked'
                );

                const indhold = document.createElement('p');
                indhold.textContent = besked.krypteretIndhold;

                const information = document.createElement('small');
                information.textContent =
                    `${besked.ejerNavn || 'Ukendt bruger'} · ${formaterDato(besked.oprettelsesDato)}`;

                beskedElement.append(indhold, information);
                beskedListe.appendChild(beskedElement);
            });

        } catch (error) {
            console.error('Fejl ved automatisk opdatering:', error);
        }
    }

    // Hent beskeder med det samme
    opdaterBeskeder();

    // Hent nye beskeder hvert andet sekund
    setInterval(opdaterBeskeder, 2000);
}

// Rediger chat (PUT /chats/:id)
const redigerForm = document.getElementById('redigerChatForm');

if (redigerForm) {
    redigerForm.addEventListener('submit', async event => {
        event.preventDefault();

        const fjernMedlemmer = [...redigerForm.querySelectorAll('[name=fjernMedlemmer]:checked')]
            .map(boks => boks.value);

        const tilfoejMedlemmer = [...(redigerForm.elements.tilfoejMedlemmer?.selectedOptions || [])]
            .map(valg => valg.value);

        const response = await fetch(`/chats/${beskedListe.dataset.chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                navn: redigerForm.elements.navn.value,
                fjernMedlemmer,
                tilfoejMedlemmer
            })
        });

        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            alert(data.fejl);
        }
    });
}

// Slet chat (DELETE /chats/:id)
const sletKnap = document.getElementById('sletChat');

if (sletKnap) {
    sletKnap.addEventListener('click', async () => {
        if (!confirm('Er du sikker på, at du vil slette chatten?')) return;

        const response = await fetch(`/chats/${beskedListe.dataset.chatId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            location.href = '/chats';
        } else {
            const data = await response.json();
            alert(data.fejl);
        }
    });
}