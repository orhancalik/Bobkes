async function fetchRandomPokemon() {
  try {
    const randomId = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon not found: ${randomId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    alert(`Error fetching random Pokémon: ${error.message}`);
  }
}

// pokemon-data.js
function processPokemonData(pokemonData) {
  const { name, sprites, stats } = pokemonData;
  const imageUrl = sprites.front_default;
  const pokemonStats = stats.map((stat) => ({
    name: stat.stat.name,
    baseStat: stat.base_stat,
  }));
  return { name, imageUrl, pokemonStats };
}

// ui.js
function updatePokemonInfo(
  pokemonData1,
  pokemonData2,
  containerId1,
  containerId2
) {
  const container1 = document.getElementById(containerId1);
  const container2 = document.getElementById(containerId2);

  if (container1 && pokemonData1 && container2 && pokemonData2) {
    const {
      name: name1,
      imageUrl: imageUrl1,
      pokemonStats: pokemonStats1,
    } = pokemonData1;
    const {
      name: name2,
      imageUrl: imageUrl2,
      pokemonStats: pokemonStats2,
    } = pokemonData2;

    // Update Pokémon 1 info
    updatePokemon(container1, name1, imageUrl1, pokemonStats1, pokemonStats2);
    // Update Pokémon 2 info
    updatePokemon(container2, name2, imageUrl2, pokemonStats2, pokemonStats1);
  }
}

function getStatColor(percentage) {
  if (percentage >= 75) {
    return "success";
  } else if (percentage >= 50) {
    return "warning";
  } else {
    return "danger";
  }
}

// main.js
document.addEventListener("DOMContentLoaded", async () => {
  const pokemon1Container = document.getElementById("pokemon1");
  const pokemon2Container = document.getElementById("pokemon2");

  // Initialize Pokémon 1 with Bulbasaur data
  const bulbasaurData = await fetchPokemonData("bulbasaur");
  updatePokemonInfo(processPokemonData(bulbasaurData), "pokemon1");

  // Initialize Pokémon 2 with random data
  const randomPokemonData = await fetchRandomPokemon();
  updatePokemonInfo(processPokemonData(randomPokemonData), "pokemon2");

  // Event listeners for choosing and randomizing Pokémon
  document
    .getElementById("choose-pokemon1-btn")
    .addEventListener("click", async () => {
      const pokemonName = prompt("Enter a Pokémon name:");
      if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(processPokemonData(pokemonData), "pokemon1");
      }
    });

  document
    .getElementById("random-pokemon1-btn")
    .addEventListener("click", async () => {
      const randomPokemonData = await fetchRandomPokemon();
      updatePokemonInfo(processPokemonData(randomPokemonData), "pokemon1");
    });

  document
    .getElementById("choose-pokemon2-btn")
    .addEventListener("click", async () => {
      const pokemonName = prompt("Enter a Pokémon name:");
      if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(processPokemonData(pokemonData), "pokemon2");
      }
    });

  document
    .getElementById("random-pokemon2-btn")
    .addEventListener("click", async () => {
      const randomPokemonData = await fetchRandomPokemon();
      updatePokemonInfo(processPokemonData(randomPokemonData), "pokemon2");
    });
});
