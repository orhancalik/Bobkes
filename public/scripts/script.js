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
      const statsMenu = container.querySelector('.statsmenu');
      statsMenu.innerHTML = ''; // Wis de huidige inhoud

      // Voeg elke statistiek toe aan de statsmenu
      pokemonData.stats.forEach(stat => {
          const statElement = document.createElement('p');
          statElement.textContent = `${stat.stat.name}: ${stat.base_stat}`;
          statsMenu.appendChild(statElement);
      });
  }
}
// Functie om te controleren of een statistiek hoger is dan de rest
function isStatHigher(stat, allStats) {
  // Vergelijk de huidige statistiek met alle andere statistieken
  return allStats.every(otherStat => {
      // Sla de vergelijking over voor dezelfde statistiek
      if (otherStat.stat.name === stat.stat.name) return true;

      // Controleer of de huidige statistiek hoger is dan de andere
      return stat.base_stat > otherStat.base_stat;
  });
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