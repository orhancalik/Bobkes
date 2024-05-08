document.addEventListener("DOMContentLoaded", function () {
  const pokemon1Select = document.getElementById("pokemon1");
  const pokemon2Select = document.getElementById("pokemon2");

  // Functie om een willekeurige Pokémon op te halen
  async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; // Er zijn momenteel 898 Pokémon
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    const data = await response.json();
    return data;
  }

  // Functie om Pokémongegevens op te halen en te tonen
  async function getPokemonData(pokemon, pokemonElement) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    );
    const data = await response.json();
    displayPokemon(data, pokemonElement);
  }

  // Functie om Pokémongegevens weer te geven op de pagina
  function displayPokemon(pokemonData, pokemonElement) {
    const nameElement = pokemonElement.querySelector(".pokemon-naam");
    nameElement.textContent =
      pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

    const imageElement = pokemonElement.querySelector(".pok");
    imageElement.src = pokemonData.sprites.front_default;

    const stats = pokemonData.stats;
    const progressBars = pokemonElement.querySelectorAll(".progress-bar");

    stats.forEach((stat, index) => {
      const statValue = stat.base_stat;
      const comparePokemon =
        pokemonElement.id === "pokemon1" ? pokemon2Select : pokemon1Select;
      const compareStatValue = parseInt(
        comparePokemon.querySelectorAll(".progress-bar")[index].style.width
      );
      const colorClass = getColorClass(statValue, compareStatValue);
      const progressBar = progressBars[index];
      progressBar.style.width = `${statValue}%`;
      progressBar.setAttribute("aria-valuenow", statValue);
      progressBar.textContent = `${statValue} ${stat.stat.name}`;
      progressBar.classList.remove("bg-success", "bg-warning", "bg-danger");
      progressBar.classList.add(colorClass);
    });
  }

  // Functie om de kleurklasse te bepalen op basis van vergelijking van statistieken
  function getColorClass(statValue, compareStatValue) {
    if (statValue > compareStatValue) {
      return "bg-success"; // Groen voor hogere waarde
    } else if (statValue === compareStatValue) {
      return "bg-warning"; // Oranje voor gelijke waarden
    } else {
      return "bg-danger"; // Rood voor lagere waarde
    }
  }

  // Event listener voor het klikken op de knop om een willekeurige Pokémon te kiezen
  document
    .getElementById("random-pokemon1-btn")
    .addEventListener("click", async function () {
      const randomPokemon = await getRandomPokemon();
      getPokemonData(randomPokemon.id, pokemon1Select);
    });

  document
    .getElementById("random-pokemon2-btn")
    .addEventListener("click", async function () {
      const randomPokemon = await getRandomPokemon();
      getPokemonData(randomPokemon.id, pokemon2Select);
    });

  // Event listener voor het klikken op de knop om een Pokémon te kiezen
  document
    .getElementById("choose-pokemon1-btn")
    .addEventListener("click", function () {
      const pokemonName = prompt(
        "Voer de naam of ID van de eerste Pokémon in:"
      );
      if (pokemonName) {
        getPokemonData(pokemonName.toLowerCase(), pokemon1Select);
      }
    });

  document
    .getElementById("choose-pokemon2-btn")
    .addEventListener("click", function () {
      const pokemonName = prompt(
        "Voer de naam of ID van de tweede Pokémon in:"
      );
      if (pokemonName) {
        getPokemonData(pokemonName.toLowerCase(), pokemon2Select);
      }
    });
});
