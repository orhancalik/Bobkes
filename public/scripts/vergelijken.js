document.addEventListener("DOMContentLoaded", function () {
  const pokemon1Select = document.getElementById("pokemon1");
  const pokemon2Select = document.getElementById("pokemon2");

  if (!pokemon1Select || !pokemon2Select) {
    console.error('Could not find pokemon1 or pokemon2 elements');
    return;
  }

  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    return await response.json();
  }

  async function getPokemonData(pokemon, pokemonElement) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
      if (!response.ok) throw new Error('Pokemon not found');
      const data = await response.json();
      displayPokemon(data, pokemonElement);
    } catch (error) {
      console.error('Error fetching pokemon data:', error);
    }
  }

  function displayPokemon(pokemonData, pokemonElement) {
    const nameElement = pokemonElement.querySelector(".pokemon-naam");
    const imageElement = pokemonElement.querySelector(".pok");

    if (!nameElement || !imageElement) {
      console.error('Name or image element not found');
      return;
    }

    nameElement.textContent = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
    imageElement.src = pokemonData.sprites.front_default;

    const stats = pokemonData.stats;
    const progressBars = pokemonElement.querySelectorAll(".progress-bar");

    stats.forEach((stat, index) => {
      const statValue = stat.base_stat;
      const comparePokemon = pokemonElement.id === "pokemon1" ? pokemon2Select : pokemon1Select;
      const compareStatValue = parseInt(
        comparePokemon.querySelectorAll(".progress-bar")[index].style.width
      ) || 0;
      const colorClass = getColorClass(statValue, compareStatValue);
      const progressBar = progressBars[index];
      progressBar.style.width = `${statValue}%`;
      progressBar.setAttribute("aria-valuenow", statValue);
      progressBar.textContent = `${statValue} ${stat.stat.name}`;
      progressBar.classList.remove("bg-success", "bg-warning", "bg-danger");
      progressBar.classList.add(colorClass);
    });
  }

  function getColorClass(statValue, compareStatValue) {
    if (statValue > compareStatValue) {
      return "bg-success";
    } else if (statValue === compareStatValue) {
      return "bg-warning";
    } else {
      return "bg-danger";
    }
  }

  document.getElementById("random-pokemon1-btn").addEventListener("click", async function () {
    const randomPokemon = await getRandomPokemon();
    getPokemonData(randomPokemon.id, pokemon1Select);
  });

  document.getElementById("random-pokemon2-btn").addEventListener("click", async function () {
    const randomPokemon = await getRandomPokemon();
    getPokemonData(randomPokemon.id, pokemon2Select);
  });

  document.getElementById("choose-pokemon1-btn").addEventListener("click", function () {
    const pokemonName = prompt("Voer de naam of ID van de eerste Pokémon in:");
    if (pokemonName) {
      getPokemonData(pokemonName.toLowerCase(), pokemon1Select);
    }
  });

  document.getElementById("choose-pokemon2-btn").addEventListener("click", function () {
    const pokemonName = prompt("Voer de naam of ID van de tweede Pokémon in:");
    if (pokemonName) {
      getPokemonData(pokemonName.toLowerCase(), pokemon2Select);
    }
  });
});

// Separate script for the detailed stats page
document.addEventListener("DOMContentLoaded", async function () {
  const pokemonDetail = document.getElementById("pokemonDetail");
  const pokemonName = window.location.pathname.split("/").pop();

  async function fetchPokemonStats(pokemonName) {
    if (!pokemonName) {
      console.error('Geen Pokémon-naam opgegeven.');
      return;
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!response.ok) {
        throw new Error(`Pokémon not found: ${pokemonName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert(`Error fetching Pokémon stats: ${error.message}`);
    }
  }

  async function displayPokemonStats() {
    try {
      const pokemonStats = await fetchPokemonStats(pokemonName);

      if (!pokemonStats) return;

      const naamPokemonStats = document.getElementById("naampokemonstats");
      const Pokemonstatspicture = document.getElementById("Pokemonstatspicture").getElementsByTagName("img")[0];

      if (naamPokemonStats && Pokemonstatspicture) {
        naamPokemonStats.textContent = pokemonStats.name;
        Pokemonstatspicture.src = pokemonStats.sprites.front_default;
      }

      const stats = document.querySelectorAll(".progress-bar");
      if (stats.length >= 6) {
        stats[0].style.width = `${pokemonStats.stats[0].base_stat}%`;
        stats[0].textContent = `HP: ${pokemonStats.stats[0].base_stat}`;
        stats[1].style.width = `${pokemonStats.stats[1].base_stat}%`;
        stats[1].textContent = `Aanval: ${pokemonStats.stats[1].base_stat}`;
        stats[2].style.width = `${pokemonStats.stats[2].base_stat}%`;
        stats[2].textContent = `Verdediging: ${pokemonStats.stats[2].base_stat}`;
        stats[3].style.width = `${pokemonStats.stats[3].base_stat}%`;
        stats[3].textContent = `Speciale Aanval: ${pokemonStats.stats[3].base_stat}`;
        stats[4].style.width = `${pokemonStats.stats[4].base_stat}%`;
        stats[4].textContent = `Speciale Verdediging: ${pokemonStats.stats[4].base_stat}`;
        stats[5].style.width = `${pokemonStats.stats[5].base_stat}%`;
        stats[5].textContent = `Snelheid: ${pokemonStats.stats[5].base_stat}`;
      }
    } catch (error) {
      console.error("Er is een fout opgetreden bij het tonen van de Pokémon stats:", error);
    }
  }

  await displayPokemonStats();
});