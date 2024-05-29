window.onload = function () {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  const offset = getRandomInt(1000);
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=8&offset=${offset}`)
    .then((response) => response.json())
    .then((data) => {
      const availablePokemon = data.results;

      availablePokemon.forEach((pokemon, index) => {
        fetch(pokemon.url)
          .then((response) => response.json())
          .then((data) => {
            fetch(data.species.url)
              .then((response) => response.json())
              .then((speciesData) => {
                fetch(speciesData.evolution_chain.url)
                  .then((response) => response.json())
                  .then((evolutionData) => {
                    const evolutionChain = [];
                    let currentEvolution = evolutionData.chain;

                    while (currentEvolution) {
                      const evolutionDetails = {
                        name: currentEvolution.species.name,
                        url: currentEvolution.species.url,
                        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                          currentEvolution.species.url.split("/")[6]
                        }.png`,
                      };
                      evolutionChain.push(evolutionDetails);
                      currentEvolution = currentEvolution.evolves_to[0];
                    }

                    const pokemonInfo = {
                      name: data.name,
                      level: Math.floor(Math.random() * 50) + 1,
                      attack: data.stats[1].base_stat,
                      defence: data.stats[3].base_stat,
                      speed: data.stats[5].base_stat,
                      captured: false,
                      image: data.sprites.front_default,
                      remainingAttempts: 3,
                      evolutions: evolutionChain,
                    };

                    const pokemonCard = document.createElement("div");
                    pokemonCard.classList.add("pokemon-card");

                    const pokemonImage = document.createElement("img");
                    pokemonImage.src = pokemonInfo.image;
                    pokemonImage.alt = pokemonInfo.name;
                    pokemonImage.classList.add("pokemon-image");

                    pokemonImage.addEventListener("click", () => {
                      window.open(pokemonInfo.image, "_blank");
                    });

                    const pokemonDetails = document.createElement("div");
                    pokemonDetails.classList.add("pokemon-details");
                    pokemonDetails.innerText = `${pokemonInfo.name} | Level: ${pokemonInfo.level}`;

                    const pokeballImage = document.createElement("img");
                    pokeballImage.src = "./assets/images/red_pokeball.png";
                    pokeballImage.alt = "Pokeball";
                    pokeballImage.classList.add("pokeball-image");

                    pokeballImage.addEventListener("click", () => {
                      if (pokemonInfo.captured) {
                        const releaseConfirmed = confirm(
                          "Deze Pokémon is al gevangen. Wil je deze vrijlaten?"
                        );
                        if (releaseConfirmed) {
                          pokemonInfo.captured = false;
                          pokeballImage.src =
                            "./assets/images/red_pokeball.png";
                        }
                      } else {
                        if (pokemonInfo.remainingAttempts > 0) {
                          const chanceToCatch =
                            100 -
                            ((pokemonInfo.defence - 20 + Math.random() * 35) %
                              100);
                          if (Math.random() * 100 < chanceToCatch) {
                            const nickname = prompt(
                              `Gefeliciteerd! Je hebt ${pokemonInfo.name} gevangen! Geef deze Pokémon een bijnaam:`
                            );
                            pokemonInfo.name = nickname
                              ? nickname
                              : pokemonInfo.name;
                            pokemonInfo.captured = true;
                            pokemonInfo.capturedDate =
                              new Date().toLocaleDateString();
                            pokeballImage.src =
                              "./assets/images/green_pokeball.png";
                            alert(`Je hebt ${pokemonInfo.name} gevangen!`);
                            catchPokemon(pokemonInfo);
                          } else {
                            alert(
                              `Je hebt ${pokemonInfo.name} niet kunnen vangen.`
                            );
                            pokemonInfo.remainingAttempts--;
                            if (
                              pokemonInfo.remainingAttempts === 0 &&
                              !pokemonInfo.captured
                            ) {
                              alert(
                                "Je hebt geen pogingen meer over. Je kunt deze Pokémon niet meer vangen. Probeer een andere Pokémon te vangen."
                              );
                            } else if (!pokemonInfo.captured) {
                              alert(
                                `Je hebt nog ${pokemonInfo.remainingAttempts} pogingen over.`
                              );
                            }
                          }
                        } else {
                          alert(
                            "Je hebt geen pogingen meer over. Je kunt deze Pokémon niet meer vangen. Probeer een andere Pokémon te vangen."
                          );
                        }
                      }
                    });

                    pokemonImage.style.width = "200px";
                    pokemonImage.style.height = "200px";
                    pokeballImage.style.width = "100px";
                    pokeballImage.style.height = "100px";

                    pokemonCard.appendChild(pokemonImage);
                    pokemonCard.appendChild(pokemonDetails);
                    pokemonCard.appendChild(pokeballImage);

                    const pokemonContainer =
                      document.getElementById("pokemonContainer");
                    if (pokemonContainer) {
                      pokemonContainer.appendChild(pokemonCard);
                    } else {
                      console.error("pokemonContainer niet gevonden!");
                    }
                  });
              });
          });
      });
    });
};

function catchPokemon(pokemon) {
  fetch("/catchPokemon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pokemon),
  })
    .then((response) => response.text())
    .then((message) => {
      alert(message);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
