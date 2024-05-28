document.addEventListener("DOMContentLoaded", async function () {
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

  // Load random Pokémon on page load
  const randomPokemon1 = await getRandomPokemon();
  getPokemonData(randomPokemon1.id, pokemon1Select);

  const randomPokemon2 = await getRandomPokemon();
  getPokemonData(randomPokemon2.id, pokemon2Select);
});
