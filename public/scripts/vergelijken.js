// pokemon-api.js
async function fetchPokemonData(pokemonName) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon not found: ${pokemonName}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    alert(`Error fetching Pokémon data: ${error.message}`);
  }
}

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

function updatePokemon(
  container,
  name,
  imageUrl,
  pokemonStats,
  otherPokemonStats
) {
  const pokemonImage = container.querySelector(".pok");
  pokemonImage.src = imageUrl;
  const pokemonNameElement = container.querySelector(".pokemon-naam");
  pokemonNameElement.textContent = name;
  const statsMenu = container.querySelector(".statsmenu");
  statsMenu.innerHTML = ""; // Clear existing stats

  pokemonStats.forEach((stat, index) => {
    const statElement = document.createElement("div");
    statElement.classList.add("progress");
    const percentage = (stat.baseStat / 255) * 100;
    const otherPercentage = (otherPokemonStats[index].base_stat / 255) * 100;
    const color = getStatColor(percentage, otherPercentage);
    statElement.innerHTML = `
      <div class="progress-bar bg-${color}" role="progressbar" style="width: ${percentage}%; aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
        ${stat.name}: ${stat.baseStat}
      </div>
    `;
    statsMenu.appendChild(statElement);
  });
}

function getStatColor(percentage, otherPercentage) {
  if (percentage > otherPercentage) {
    return "success"; // Green for higher stat
  } else if (percentage === otherPercentage) {
    return "warning"; // Yellow for equal stats
  } else {
    return "danger"; // Red for lower stat
  }
}

// main.js
document.addEventListener("DOMContentLoaded", async () => {
  const pokemon1Container = document.getElementById("pokemon1");
  const pokemon2Container = document.getElementById("pokemon2");

  // Initialize Pokémon 1 with Bulbasaur data
  const bulbasaurData = await fetchPokemonData("bulbasaur");
  let randomPokemonData = await fetchRandomPokemon();
  updatePokemonInfo(
    processPokemonData(bulbasaurData),
    processPokemonData(randomPokemonData),
    "pokemon1",
    "pokemon2"
  );

  // Event listeners for choosing and randomizing Pokémon
  document
    .getElementById("choose-pokemon1-btn")
    .addEventListener("click", async () => {
      const pokemonName = prompt("Enter a Pokémon name:");
      if (pokemonName) {
        const pokemonData1 = await fetchPokemonData(pokemonName);
        randomPokemonData = await fetchRandomPokemon();
        updatePokemonInfo(
          processPokemonData(pokemonData1),
          processPokemonData(randomPokemonData),
          "pokemon1",
          "pokemon2"
        );
      }
    });

  document
    .getElementById("random-pokemon1-btn")
    .addEventListener("click", async () => {
      const randomPokemonData1 = await fetchRandomPokemon();
      randomPokemonData = await fetchRandomPokemon();
      updatePokemonInfo(
        processPokemonData(randomPokemonData1),
        processPokemonData(randomPokemonData),
        "pokemon1",
        "pokemon2"
      );
    });

  document
    .getElementById("choose-pokemon2-btn")
    .addEventListener("click", async () => {
      const pokemonName = prompt("Enter a Pokémon name:");
      if (pokemonName) {
        const pokemonData2 = await fetchPokemonData(pokemonName);
        updatePokemonInfo(
          processPokemonData(bulbasaurData),
          processPokemonData(pokemonData2),
          "pokemon1",
          "pokemon2"
        );
      }
    });

  document
    .getElementById("random-pokemon2-btn")
    .addEventListener("click", async () => {
      const randomPokemonData2 = await fetchRandomPokemon();
      updatePokemonInfo(
        processPokemonData(bulbasaurData),
        processPokemonData(randomPokemonData2),
        "pokemon1",
        "pokemon2"
      );
    });
});
