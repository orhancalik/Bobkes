// In pokemoncatcher.js
window.onload = function () {
    const pokemonContainer = document.getElementById("pokemonContainer");

    // Haal 20 willekeurige Pokémon op van de PokeAPI
    fetch("https://pokeapi.co/api/v2/pokemon?limit=5")
        .then(response => response.json())
        .then(data => {
            const availablePokemon = data.results;

            // Toon de beschikbare Pokémon
            availablePokemon.forEach((pokemon, index) => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(data => {
                        const pokemonInfo = {
                            name: data.name,
                            defence: data.stats[3].base_stat, // Veronderstel dat de 4e statistiek de verdediging is
                            captured: false,
                            image: data.sprites.front_default,
                            remainingAttempts: 3 // Voeg het aantal resterende pogingen toe
                        };

                        const pokemonCard = document.createElement("div");
                        pokemonCard.classList.add("pokemon-card");

                        const pokemonImage = document.createElement("img");
                        pokemonImage.src = pokemonInfo.image;
                        pokemonImage.alt = pokemonInfo.name;
                        pokemonImage.classList.add("pokemon-image");

                        // Voeg een klikgebeurtenis toe om de Pokémon te bekijken
                        pokemonImage.addEventListener("click", () => {
                            // Open een venster met de afbeelding van de Pokémon
                            window.open(pokemonInfo.image, "_blank");
                        });

                        // Voeg een pokebal-afbeelding toe
                        const pokeballImage = document.createElement("img");
                        pokeballImage.src = "./assets/images/red_pokeball.png"; // Standaard rode pokebal
                        pokeballImage.alt = "Pokeball";
                        pokeballImage.classList.add("pokeball-image");

                        // Voeg een klikgebeurtenis toe om de Pokémon te vangen
                        pokeballImage.addEventListener("click", () => {
                            if (pokemonInfo.captured) {
                                // Melding om Pokémon vrij te laten
                                const releaseConfirmed = confirm("Deze Pokémon is al gevangen. Wil je deze vrijlaten?");
                                if (releaseConfirmed) {
                                    // Verander de status van de Pokémon naar niet-gevangen
                                    pokemonInfo.captured = false;
                                    // Verander de rand van de pokebal-afbeelding naar rood
                                    pokeballImage.src = "./assets/images/red_pokeball.png";
                                }
                            } else {
                                // Bereken de kans om de Pokémon te vangen
                                const chanceToCatch = 100 - (pokemonInfo.defence - 20 + Math.random() * 35) % 100;

                                // Doe een poging om de Pokémon te vangen
                                if (Math.random() * 100 < chanceToCatch) {
                                    const nickname = prompt(`Gefeliciteerd! Je hebt ${pokemonInfo.name} gevangen! Geef deze Pokémon een bijnaam:`);
                                    pokemonInfo.name = nickname || pokemonInfo.name; // Gebruik de ingevoerde bijnaam, anders behoud de originele naam
                                    pokemonInfo.captured = true;
                                    pokeballImage.src = "./assets/images/green_pokeball.png";
                                } else {
                                    alert(`Je hebt ${pokemonInfo.name} niet kunnen vangen.`);
                                }

                                // Verminder het aantal resterende pogingen en toon het aan de gebruiker
                                pokemonInfo.remainingAttempts--;
                                if (pokemonInfo.remainingAttempts === 0 && !pokemonInfo.captured) {
                                    alert("Je hebt geen pogingen meer over.");
                                } else if (!pokemonInfo.captured) {
                                    alert(`Je hebt nog ${pokemonInfo.remainingAttempts} pogingen over.`);
                                }
                            }
                        });

                        // Pas de grootte van de afbeeldingen aan
                        pokemonImage.style.width = "200px"; // Pas deze grootte naar wens aan
                        pokemonImage.style.height = "200px"; // Pas deze grootte naar wens aan
                        pokeballImage.style.width = "100px"; // Pas deze grootte naar wens aan
                        pokeballImage.style.height = "100px"; // Pas deze grootte naar wens aan

                        // Voeg de elementen toe aan de container
                        pokemonCard.appendChild(pokemonImage);
                        pokemonCard.appendChild(pokeballImage);
                        pokemonContainer.appendChild(pokemonCard);
                    });
            });
        });
};