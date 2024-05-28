document.addEventListener("DOMContentLoaded", () => {
  let battleResultDiv = document.getElementById("battleResult");
  let attacker = "user";

  document.querySelectorAll(".move").forEach((button) => {
    button.addEventListener("click", async () => {
      const move = button.dataset.move;
      try {
        const response = await fetch("/pokemonbattle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attacker: attacker,
            move: move,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        currentPokemon1 = data.currentPokemon1;
        currentPokemon2 = data.currentPokemon2;

        if (battleResultDiv) {
          battleResultDiv.innerText = data.message;
        }

        const pokemon1HPBar = document.getElementById("pokemon1HPBar");
        const pokemon2HPBar = document.getElementById("pokemon2HPBar");

        // Update HP bars
        pokemon1HPBar.style.width = `${currentPokemon1.hp}%`;
        pokemon1HPBar.innerText = `HP: ${currentPokemon1.hp}`;

        pokemon2HPBar.style.width = `${currentPokemon2.hp}%`;
        pokemon2HPBar.innerText = `HP: ${currentPokemon2.hp}`;

        attacker = attacker === "user" ? "opponent" : "user";

        if (currentPokemon1.hp <= 0 || currentPokemon2.hp <= 0) {
          battleResultDiv.innerText = "Battle Over!";
          document.querySelectorAll(".move").forEach((btn) => {
            btn.disabled = true;
          });
        }
      } catch (error) {
        console.error("Error during move:", error);
      }
    });
  });

  document
    .getElementById("searchButton")
    .addEventListener("click", async () => {
      const pokemonName = document
        .getElementById("searchInput")
        .value.toLowerCase();
      if (pokemonName) {
        try {
          const response = await fetch(`/pokemonsearch/${pokemonName}`);
          if (!response.ok) throw new Error("Pokemon niet gevonden");

          const pokemonDetails = await response.json();
          displayPokemonDetails(pokemonDetails);
        } catch (error) {
          console.error(
            "Er is een fout opgetreden bij het ophalen van Pokémon-details:",
            error
          );
          // Handle the error, for example, show an error message to the user
        }
      } else {
        console.error("Voer een Pokémon-naam in om te zoeken.");
        // Display a message to the user to enter a Pokémon name
      }
    });

  function displayPokemonDetails(pokemonDetails) {
    const pokemon2Element = document.getElementById("pokemon2");
    const pokemon2Image = pokemon2Element.querySelector("img");
    const pokemon2Name = pokemon2Element.querySelector("h3");
    const pokemon2Moveset = pokemon2Element.querySelector(".moveset");

    // Update the Pokémon image and name
    if (pokemon2Image && pokemon2Name) {
      pokemon2Image.src = pokemonDetails.sprite;
      pokemon2Name.textContent = pokemonDetails.name;
    }

    // Update the moveset
    if (pokemon2Moveset) {
      pokemon2Moveset.innerHTML = ""; // Clear the current moves

      const moves = pokemonDetails.moves.slice(0, 4); // Get only the first four moves

      moves.forEach((move) => {
        const moveButton = document.createElement("button");
        moveButton.className = "move";
        moveButton.dataset.pokemon = "2";
        moveButton.dataset.move = move;
        moveButton.textContent = move;
        moveButton.addEventListener("click", async () => {
          const move = moveButton.dataset.move;
          try {
            const response = await fetch("/pokemonbattle", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                attacker: attacker,
                move: move,
              }),
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const data = await response.json();

            currentPokemon1 = data.currentPokemon1;
            currentPokemon2 = data.currentPokemon2;

            if (battleResultDiv) {
              battleResultDiv.innerText = data.message;
            }

            const pokemon1HPBar = document.getElementById("pokemon1HPBar");
            const pokemon2HPBar = document.getElementById("pokemon2HPBar");

            // Update HP bars
            pokemon1HPBar.style.width = `${currentPokemon1.hp}%`;
            pokemon1HPBar.innerText = `HP: ${currentPokemon1.hp}`;

            pokemon2HPBar.style.width = `${currentPokemon2.hp}%`;
            pokemon2HPBar.innerText = `HP: ${currentPokemon2.hp}`;

            attacker = attacker === "user" ? "opponent" : "user";

            if (currentPokemon1.hp <= 0 || currentPokemon2.hp <= 0) {
              battleResultDiv.innerText = "Battle Over!";
              document.querySelectorAll(".move").forEach((btn) => {
                btn.disabled = true;
              });
            }
          } catch (error) {
            console.error("Error during move:", error);
          }
        });

        pokemon2Moveset.appendChild(moveButton);
      });
    }
  }
});
