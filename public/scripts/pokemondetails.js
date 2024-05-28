document.addEventListener('DOMContentLoaded', () => {
    const incrementButtons = document.querySelectorAll('.increment-btn');

    incrementButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const type = button.getAttribute('data-type');
            const action = button.getAttribute('data-action');
            const pokemonName = document.querySelector('h1').textContent.split(': ')[1]; // Zorg ervoor dat dit overeenkomt met je HTML structuur

            if (!pokemonName) {
                console.error('Pokémon naam niet gevonden');
                return;
            }

            try {
                const response = await fetch(`/pokemon/${pokemonName}/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type, action })
                });

                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Failed to update Pokémon stats');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});