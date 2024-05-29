document.addEventListener("DOMContentLoaded", () => {
  let battleResultDiv = document.getElementById("battleResult");
  let attacker = "user";
  document.querySelectorAll(".move").forEach((item) => {
    item.addEventListener("click", (event) => {
      const attackerIndex = item.dataset.pokemon; // Index van de aanvallende Pokémon
      const moveIndex = item.dataset.move; // Index van de geselecteerde aanval
      const defenderIndex = attackerIndex === "1" ? "2" : "1"; // Index van de verdedigende Pokémon

      // Roep de performAttack-functie aan met de juiste parameters
      performAttack(
        parseInt(attackerIndex),
        parseInt(defenderIndex),
        parseInt(moveIndex),
        pokemonDetails
      );
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

  // battler.js

  // Definieer de Pokémon details
  let pokemonDetails = [
    {
      name: "Pokemon1",
      moves: ["move1", "move2", "move3", "move4"],
      sprite: "url-to-sprite1",
      hp: 100,
      defence: 5,
      attack: 10, // Voeg een dummy waarde voor aanval toe (vervang dit met echte waarden)
    },
    {
      name: "Pokemon2",
      moves: ["move1", "move2", "move3", "move4"],
      sprite: "url-to-sprite2",
      hp: 100,
      defence: 5,
      attack: 8, // Voeg een dummy waarde voor aanval toe (vervang dit met echte waarden)
    },
  ];

  let isUserTurn = true; // Vlag om bij te houden wiens beurt het is

  // Voer een aanval uit tussen twee Pokémon
  async function performAttack(attackerIndex, defenderIndex, moveIndex) {
    const attacker = pokemonDetails[attackerIndex];
    const defender = pokemonDetails[defenderIndex];

    // Bereken de schade met de logica: HP – (defense – attack)
    const attackPower = attacker.attack; // Huidige aanvaller aanvalskracht
    const defensePower = defender.defence; // Huidige verdediger verdedigingskracht
    const damage = attackPower - defensePower;

    if (damage > 0) {
      defender.hp -= damage;
      if (defender.hp < 0) defender.hp = 0; // Zorg ervoor dat HP niet negatief wordt
    }

    // Update de UI met de nieuwe HP-waarden
    document.getElementById(`pokemon${defenderIndex + 1}HP`).innerText =
      defender.hp;
    document.getElementById(
      `pokemon${defenderIndex + 1}HPBar`
    ).style.width = `${defender.hp}%`;

    // Log de aanval in battleResultDiv
    const logEntry = document.createElement("div");
    logEntry.textContent = `${attacker.name} used ${pokemonDetails[attackerIndex].moves[moveIndex]} against ${defender.name} causing ${damage} damage`;
    battleResultDiv.appendChild(logEntry);

    // Controleer of de strijd voorbij is
    if (defender.hp <= 0) {
      document.getElementById(
        "battleResult"
      ).innerText = `${attacker.name} wins!`;
      return true; // Gevecht voorbij
    }

    return false; // Gevecht niet voorbij
  }

  // Functie om een korte vertraging toe te voegen (voor realisme tussen aanvallen)
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Event listeners voor de aanvalsknoppen
  document.querySelectorAll(".move").forEach((item) => {
    item.addEventListener("click", async (event) => {
      if (!isUserTurn) return; // Als het niet de beurt van de gebruiker is, doe niets

      const attackerIndex = parseInt(item.dataset.pokemon) - 1; // Index van de aanvallende Pokémon
      const moveIndex = parseInt(item.dataset.move); // Index van de geselecteerde aanval
      const defenderIndex = attackerIndex === 0 ? 1 : 0; // Index van de verdedigende Pokémon

      // Roep de performAttack-functie aan met de juiste parameters
      const battleOver = await performAttack(
        attackerIndex,
        defenderIndex,
        moveIndex
      );

      // Als de strijd niet voorbij is, laat de tweede Pokémon automatisch aanvallen
      if (!battleOver) {
        isUserTurn = false; // Zet de vlag om naar de beurt van de tegenstander
        await delay(1000); // Voeg een kleine vertraging toe voor realisme
        const opponentMoveIndex = Math.floor(Math.random() * 4); // Kies een willekeurige aanval voor de tegenstander
        const opponentBattleOver = await performAttack(
          defenderIndex,
          attackerIndex,
          opponentMoveIndex
        );

        if (!opponentBattleOver) {
          isUserTurn = true; // Zet de vlag terug naar de beurt van de gebruiker
        }
      }
    });
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