document.addEventListener("DOMContentLoaded", () => {
  const battleForm = document.getElementById("battleForm");
  const startBattleButton = document.getElementById("startBattle");
  const battleResultDiv = document.getElementById("battleResult");
  const pokemon1Select = document.getElementById("pokemon1");
  const pokemon2Select = document.getElementById("pokemon2");
  const pokemon1MoveSelect = document.getElementById("pokemon1Move");
  const pokemon2MoveSelect = document.getElementById("pokemon2Move");

  const fetchPokemonMoves = async (pokemonName, moveSelect) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
      );
      const pokemonData = await response.json();
      const moves = pokemonData.moves.map((move) => move.move.name);

      moveSelect.innerHTML = "";
      moves.slice(0, 4).forEach((move) => {
        const option = document.createElement("option");
        option.value = move;
        option.text = move;
        moveSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching moves:", error);
    }
  };

  pokemon1Select.addEventListener("change", (event) => {
    fetchPokemonMoves(event.target.value, pokemon1MoveSelect);
  });

  pokemon2Select.addEventListener("change", (event) => {
    fetchPokemonMoves(event.target.value, pokemon2MoveSelect);
  });

  startBattleButton.addEventListener("click", async () => {
    const pokemon1 = pokemon1Select.value;
    const pokemon1Move = pokemon1MoveSelect.value;
    const pokemon2 = pokemon2Select.value;
    const pokemon2Move = pokemon2MoveSelect.value;

    try {
      const response = await fetch("/pokemonbattle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pokemon1,
          pokemon1Move,
          pokemon2,
          pokemon2Move,
        }),
      });

      const result = await response.json();
      battleResultDiv.innerHTML = `
        <h2>Battle Result</h2>
        <p>${result.message}</p>
        <div>
          <h3>${result.currentPokemon1.name}</h3>
          <img src="${result.currentPokemon1.sprite}" alt="${
        result.currentPokemon1.name
      }" />
          <p>Moves: ${result.currentPokemon1.moves.join(", ")}</p>
          <p>HP: ${result.currentPokemon1.hp}</p>
        </div>
        <div>
          <h3>${result.currentPokemon2.name}</h3>
          <img src="${result.currentPokemon2.sprite}" alt="${
        result.currentPokemon2.name
      }" />
          <p>Moves: ${result.currentPokemon2.moves.join(", ")}</p>
          <p>HP: ${result.currentPokemon2.hp}</p>
        </div>
      `;
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Initialize moves for default selections
  fetchPokemonMoves(pokemon1Select.value, pokemon1MoveSelect);
  fetchPokemonMoves(pokemon2Select.value, pokemon2MoveSelect);
});
