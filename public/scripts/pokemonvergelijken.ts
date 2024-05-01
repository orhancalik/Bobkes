document.addEventListener("DOMContentLoaded", async function () {
    // Haal de URL van de Pokemon op
    const pokemonURL: string = "https://pokeapi.co/api/v2/pokemon/bulbasaur";

    try {
        // Haal de gegevens van de Pokemon op
        const response: Response = await fetch(pokemonURL);
        const data: any = await response.json();

        // Haal de afbeeldings-URL op
        const imageUrl: string = data.sprites.front_default;

        // Laad de afbeelding in
        const pokemonImage: HTMLImageElement | null = document.getElementById("pokemonImage") as HTMLImageElement;
        if (pokemonImage) pokemonImage.src = imageUrl;

        // Haal de naam van de Pokemon op en werk de DOM bij
        const pokemonName: HTMLElement | null = document.getElementById("pokemon-naam");
        if (pokemonName) pokemonName.textContent = data.name;

        // Haal de statistieken op en werk de DOM bij
        updatePokemonInfo(data, 'pokemon1');

        // Roep de functie aan om Pokémon te vergelijken
        const randomPokemonData: any = await fetchRandomPokemon();
        updatePokemonInfo(randomPokemonData, 'pokemon2');
    } catch (error) {
        console.error("Error:", error);
    }
});

// Functie om de gegevens van een specifieke Pokémon op te halen
async function fetchPokemonData(pokemonName: string): Promise<any> {
    try {
        const response: Response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
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
async function fetchRandomPokemon(): Promise<any> {
    try {
        // Genereer een willekeurig nummer tussen 1 en 898 (het totale aantal Pokémon in de PokeAPI)
        const randomId: number = Math.floor(Math.random() * 898) + 1;
        const response: Response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        if (!response.ok) {
            throw new Error('Pokémon niet gevonden');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Er is een fout opgetreden bij het ophalen van een willekeurige Pokémon.');
    }
}

function updatePokemonInfo(pokemonData: any, containerId: string): void {
    const container: HTMLElement | null = document.getElementById(containerId);
    if (container && pokemonData) {
        // Update de afbeelding
        const pokemonImage: HTMLImageElement | null = container.querySelector('.pok');
        if (pokemonImage) pokemonImage.src = pokemonData.sprites.front_default;

        // Update de naam
        const pokemonNameElement: HTMLElement | null = container.querySelector('.pokemon-naam');
        if (pokemonNameElement) pokemonNameElement.textContent = pokemonData.name;

        // Voeg hier extra logica toe om andere statistieken bij te werken
        const statsMenu: HTMLElement | null = container.querySelector('.statsmenu');
        if (statsMenu) {
            statsMenu.innerHTML = ''; // Wis de huidige inhoud
            // Voeg elke statistiek toe aan de statsmenu
            pokemonData.stats.forEach((stat: any) => {
                const statElement: HTMLDivElement = document.createElement('div');
                statElement.classList.add('progress');
                const percentage: number = (stat.base_stat / 255) * 100; // Bereken de percentage waarde van de statistiek
                statElement.innerHTML = `
                    <div class="progress-bar bg-${getStatColor(percentage)}" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                        ${stat.stat.name}: ${stat.base_stat}
                    </div>
                `;
                statsMenu.appendChild(statElement);
            });
        }
    }
}

// Functie om de kleur van de statistiekbalk te bepalen op basis van de percentage waarde
function getStatColor(percentage: number): string {
    if (percentage >= 75) {
        return 'success';
    } else if (percentage >= 50) {
        return 'warning';
    } else {
        return 'danger';
    }
}

document.getElementById('choose-pokemon1-btn')?.addEventListener('click', async () => {
    const pokemonName: string | null = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData: any = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon1');
    }
});

// Event listener voor het kiezen van Pokémon 2
document.getElementById('choose-pokemon2-btn')?.addEventListener('click', async () => {
    const pokemonName: string | null = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData: any = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon2');
    }
});

// Event listener voor de knop om een willekeurige Pokémon voor pokemon1 op te halen
document.getElementById('random-pokemon1-btn')?.addEventListener('click', async () => {
    const randomPokemonData: any = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon1');
});

// Event listener voor de knop om een willekeurige Pokémon voor pokemon2 op te halen
document.getElementById('random-pokemon2-btn')?.addEventListener('click', async () => {
    const randomPokemonData: any = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon2');
});
