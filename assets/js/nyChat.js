const form = document.getElementById('nyChatForm');

form.addEventListener('submit', async event => {
    event.preventDefault();

    const medlemmer = [...form.elements.medlemmer.selectedOptions]
        .map(valg => valg.value);

    const response = await fetch('/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            navn: form.elements.navn.value,
            medlemmer
        })
    });

    const data = await response.json();

    if (response.ok) {
        location.href = '/chat/' + data.id;
    } else {
        alert(data.fejl);
    }
});