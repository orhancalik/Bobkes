document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM volledig geladen en geparsed');
    
    const incrementButtons = document.querySelectorAll('.increment-btn');

    incrementButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const type = button.getAttribute('data-type');
            const action = button.getAttribute('data-action');
            const h1Element = document.querySelector('h1');
            
            if (!h1Element) {
                console.error('h1 element niet gevonden');
                return;
            }

            console.log('h1 element gevonden:', h1Element.textContent);

            const pokemonName = h1Element.textContent.split(': ')[1]; // Zorg ervoor dat dit overeenkomt met je HTML structuur

            if (!pokemonName) {
                console.error('Pokémon naam niet gevonden');
                return;
            }

            console.log('Pokémon naam gevonden:', pokemonName);

            // Haal de huidige waarde op basis van het type (wins of losses)
            const valueElement = document.querySelector(`p[data-type="${type}"] .value`);
            if (!valueElement) {
                console.error(`Element met data-type ${type} niet gevonden`);
                return;
            }

            let currentValue = parseInt(valueElement.textContent);
            if (isNaN(currentValue)) {
                currentValue = 0; // Start vanaf 0 als de huidige waarde geen nummer is
            }

            // Bereken de nieuwe waarde
            const newValue = action === 'increment' ? currentValue + 1 : currentValue - 1;

            try {
                const response = await fetch(`/pokemon/${pokemonName}/update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type, action })
                });

                if (response.ok) {
                    // Update de waarde in de DOM zonder de pagina te herladen
                    valueElement.textContent = newValue;
                } else {
                    console.error('Failed to update Pokémon stats');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});