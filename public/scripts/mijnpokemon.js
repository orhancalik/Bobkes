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

document.addEventListener("DOMContentLoaded", async function () {
  const pokedexList = document.getElementById("pokedexList");
  const morePokemonBtn = document.getElementById("morePokemonBtn");
  const allPokemonBtn = document.getElementById("allPokemonBtn");
  let limit = 50; // Beginlimiet

  async function fetchAndDisplayPokemons(offset) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      const pokemons = data.results;

      const pokemonDataPromises = pokemons.map(async function (pokemon) {
        const pokemonResponse = await fetch(pokemon.url);
        return await pokemonResponse.json();
      });

      const pokemonDataArray = await Promise.all(pokemonDataPromises);

      pokemonDataArray.sort((a, b) => {
        return a.id - b.id;
      });

      pokedexList.innerHTML = "";

      pokemonDataArray.forEach(function (pokemonData) {
        const article = document.createElement("article");
        article.classList.add("MijnPokemonLijst");

        const img = document.createElement("img");
        img.src = pokemonData.sprites.front_default;
        img.alt = pokemonData.name;

        const spanNumber = document.createElement("span");
        spanNumber.classList.add("pokemonNumber");
        spanNumber.textContent = `#${pokemonData.id} ${pokemonData.name}`;

        article.appendChild(img);
        article.appendChild(spanNumber);

        pokedexList.appendChild(article);
      });

      if (pokemonDataArray.length >= limit && limit < 10000) {
        morePokemonBtn.style.display = "block";
      } else {
        morePokemonBtn.style.display = "none";
      }

      allPokemonBtn.style.display = "none";
    } catch (error) {
      console.error("Er is een fout opgetreden bij het ophalen van de Pokémon:", error);
    }
  }

  morePokemonBtn.addEventListener("click", async function () {
    const currentPokemonCount = pokedexList.querySelectorAll(".MijnPokemonLijst").length;
    await fetchAndDisplayPokemons(currentPokemonCount);
    limit += 50; // Verhoog de limiet met 50
  });

  allPokemonBtn.addEventListener("click", async function () {
    await fetchAndDisplayPokemons(0);
  });
});