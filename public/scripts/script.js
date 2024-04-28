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
  
  // Functie om de DOM bij te werken met de gegevens van de Pokémon
  function updatePokemonInfo(pokemonData, containerId) {
    const container = document.getElementById(containerId);
    if (container && pokemonData) {
      container.querySelector('.pok').src = pokemonData.sprites.front_default;
      container.querySelector('.pokemon-naam').textContent = pokemonData.name;
      // Voeg hier extra logica toe om andere statistieken bij te werken
    }
  }
  
  // Event listeners voor de knoppen
  document.getElementById('choose-pokemon1-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
      const pokemonData = await fetchPokemonData(pokemonName);
      updatePokemonInfo(pokemonData, 'pokemon1');
    }
  });
  
  document.getElementById('random-pokemon1-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon1');
  });
  
  document.getElementById('choose-pokemon2-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
      const pokemonData = await fetchPokemonData(pokemonName);
      updatePokemonInfo(pokemonData, 'pokemon2');
    }
  });
  
  document.getElementById('random-pokemon2-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon2');
  });
  
  // Functie om een willekeurige Pokémon op te halen
  async function fetchRandomPokemon() {
    const totalPokemon = 898; // Het totale aantal Pokémon beschikbaar in de PokéAPI
    const randomId = Math.floor(Math.random() * totalPokemon) + 1;
    return await fetchPokemonData(randomId.toString());
  }
  