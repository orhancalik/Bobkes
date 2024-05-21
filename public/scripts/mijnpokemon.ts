async function fetchPokemonData(pokemonName: string): Promise<any> {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon niet gevonden: ${pokemonName}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(error);
    alert(`Fout bij ophalen Pokémon-gegevens: ${error.message}`);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const pokedexList = document.getElementById("pokedexList")!;
  const morePokemonBtn = document.getElementById(
    "morePokemonBtn"
  ) as HTMLElement;
  const allPokemonBtn = document.createElement("button");
  allPokemonBtn.textContent = "Klik hier voor alle pokemons te bekijken";
  allPokemonBtn.classList.add("myBttn");
  document.body.appendChild(allPokemonBtn);

  if (!pokedexList) {
    console.error("Kon element '#pokedexList' niet vinden.");
    return;
  }

  async function fetchAndDisplayPokemons(offset: number): Promise<void> {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=50&offset=${offset}`
      );
      const data = await response.json();
      const pokemons: any[] = data.results;

      const pokemonDataPromises = pokemons.map(async function (pokemon) {
        const pokemonResponse = await fetch(pokemon.url);
        return await pokemonResponse.json();
      });

      const pokemonDataArray: any[] = await Promise.all(pokemonDataPromises);

      pokemonDataArray.sort((a, b) => {
        return a.id - b.id;
      });

      const currentPokemonCount =
        pokedexList?.querySelectorAll(".MijnPokemonLijst").length || 0;

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

      if (pokemonDataArray.length >= 50) {
        morePokemonBtn.style.display = "block";
      } else {
        morePokemonBtn.style.display = "none";
      }

      allPokemonBtn.style.display = "none";
    } catch (error: any) {
      console.error("Fout bij ophalen Pokémon:", error);
    }
  }

  morePokemonBtn.addEventListener("click", async function () {
    const currentPokemonCount =
      pokedexList?.querySelectorAll(".MijnPokemonLijst").length || 0;
    await fetchAndDisplayPokemons(currentPokemonCount);
  });

  allPokemonBtn.addEventListener("click", async function () {
    await fetchAndDisplayPokemons(0);
  });
});
