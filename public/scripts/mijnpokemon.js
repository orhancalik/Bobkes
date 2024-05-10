
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
    const allPokemonBtn = document.getElementById("allPokemonBtn");
    const pokedexList = document.getElementById("pokedexList");
  
    
    allPokemonBtn.addEventListener("click", async function () {
      try {
        let pokemons = [];
        for (let offset = 0; offset < 10000; offset += 100) {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=100&offset=${offset}`);
          const data = await response.json();
          pokemons = pokemons.concat(data.results);
        }
  

      const pokemonDataPromises = pokemons.map(async function (pokemon) {
        const pokemonResponse = await fetch(pokemon.url);
        return await pokemonResponse.json();
      });

      const pokemonDataArray = await Promise.all(pokemonDataPromises);
      pokemonDataArray.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  
      
        pokedexList.innerHTML = "";
  
       
        pokemons.forEach(async function (pokemon) {
          const pokemonResponse = await fetch(pokemon.url);
          const pokemonData = await pokemonResponse.json();
  
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

        morePokemonBtn.style.display = "block";
      } catch (error) {
        console.error("Er is een fout opgetreden bij het ophalen van de Pokémon:", error);
      }
    });
  });
  