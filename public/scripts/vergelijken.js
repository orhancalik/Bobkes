document.addEventListener("DOMContentLoaded", async function () {
    // Haal de URL van de Pokemon op
    const pokemonURL = "https://pokeapi.co/api/v2/pokemon/bulbasaur";
  
    try {
        // Haal de gegevens van de Pokemon op
        const response = await fetch(pokemonURL);
        const data = await response.json();
    
        // Haal de afbeeldings-URL op
        const imageUrl = data.sprites.front_default;
    
        // Laad de afbeelding in
        const pokemonImage = document.getElementById("pokemonImage");
        const pokemonImage2 = document.getElementById("pokemonImage2");
        pokemonImage2.src = imageUrl
        pokemonImage.src = imageUrl;
    
        // Haal de statistieken op en werk de DOM bij
        updatePokemonInfo(data, 'pokemon1');
    
        // Roep de functie aan om Pokémon te vergelijken
        const randomPokemonData = await fetchRandomPokemon();
        updatePokemonInfo(randomPokemonData, 'pokemon2');
        //updateAndComparePokemonInfo(data, randomPokemonData);
    } catch (error) {
        console.error("Error:", error);
    }
});


// Functie om de gegevens van een specifieke Pokémon op te halen
async function fetchPokemonData(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokémon niet gevonden');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Er is een fout opgetreden bij het ophalen van de Pokémon-gegevens.');
    }
}

// Functie om een willekeurige Pokémon op te halen van de PokeAPI
async function fetchRandomPokemon() {
    try {
        // Genereer een willekeurig nummer tussen 1 en 898 (het totale aantal Pokémon in de PokeAPI)
        const randomId = Math.floor(Math.random() * 898) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        if (!response.ok) {
            throw new Error('Pokémon niet gevonden');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Er is een fout opgetreden bij het ophalen van een willekeurige Pokémon.');
    }
}


// Functie om de DOM bij te werken met de gegevens van de Pokémon
function updatePokemonInfo(pokemonData, containerId) {
    const container = document.getElementById(containerId);
    if (container && pokemonData) {
        container.querySelector('.pok').src = pokemonData.sprites.front_default;
        const pokemonNameElement = container.querySelector('.pokemon-naam');
        if (pokemonNameElement) {
            pokemonNameElement.textContent = pokemonData.name;
        }
  
        // Voeg hier extra logica toe om andere statistieken bij te werken
        const statsMenu = container.querySelector('.statsmenu');
        statsMenu.innerHTML = ''; // Wis de huidige inhoud
  
        // Voeg elke statistiek toe aan de statsmenu
        pokemonData.stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.classList.add('progress');
            const percentage = (stat.base_stat / 255) * 100; // Bereken de percentage waarde van de statistiek
            statElement.innerHTML = `
                <div class="progress-bar bg-${getStatColor(percentage)}" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    ${stat.stat.name}: ${stat.base_stat}
                </div>
            `;
            statsMenu.appendChild(statElement);
        });
    }
}

// Functie om de kleur van de statistiekbalk te bepalen op basis van de percentage waarde
function getStatColor(percentage) {
    if (percentage >= 75) {
        return 'success';
    } else if (percentage >= 50) {
        return 'warning';
    } else {
        return 'danger';
    }
}

// Event listener voor het kiezen van Pokémon 1
document.getElementById('choose-pokemon1-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon1');
        const pokemonName2 = document.getElementById('pokemon2').querySelector('.pokemon-naam').textContent;
        console.log(document.getElementById('pokemon2'));

        if (pokemonName2) {
            const pokemonData2 = await fetchPokemonData(pokemonName2);
            if (pokemonData2) {
                updateAndComparePokemonInfo(pokemonData, pokemonData2);
            }
        }
    }
});

// Event listener voor het kiezen van Pokémon 2
document.getElementById('choose-pokemon2-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon2');
        const pokemonName1 = document.getElementById('pokemon1').querySelector('.pokemon-naam').textContent;
        if (pokemonName1) {
            const pokemonData1 = await fetchPokemonData(pokemonName1);
            if (pokemonData1) {
                updateAndComparePokemonInfo(pokemonData1, pokemonData);
            }
        }
    }
});


// Event listener voor de knop om een willekeurige Pokémon voor pokemon1 op te halen
document.getElementById('random-pokemon1-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon1');
});

// Event listener voor de knop om een willekeurige Pokémon voor pokemon2 op te halen
document.getElementById('random-pokemon2-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon2');
    const pokemonData1Name = document.getElementById('pokemon1').querySelector('.pokemon-naam');
    if (pokemonData1Name) {
        const pokemonData1 = await fetchPokemonData(pokemonData1Name.textContent);
        if (pokemonData1) {
            updateAndComparePokemonInfo(pokemonData1, randomPokemonData);
        }
    }
});
