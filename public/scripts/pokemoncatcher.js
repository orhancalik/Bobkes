// In pokemoncatcher.js
window.onload = function () {
    const pokemonContainer = document.getElementById("pokemonContainer");
    // Functie om een willekeurig getal te genereren binnen een bereik
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    // Haal 20 willekeurige Pokémon op van de PokeAPI
    const offset = getRandomInt(1000); // Haal een willekeurige offset binnen een bereik (bijvoorbeeld tot 1000)
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=8&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            const availablePokemon = data.results;
            // Toon de beschikbare Pokémon
            availablePokemon.forEach((pokemon, index) => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(data => {
                        const pokemonInfo = {
                            name: data.name, // Gebruik de naam zoals deze uit de API komt
                            level: Math.floor(Math.random() * 50) + 1, // Random level tussen 1 en 50
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
                        // Voeg een div toe voor de naam en level van de Pokémon
                        const pokemonDetails = document.createElement("div");
                        pokemonDetails.classList.add("pokemon-details");
                        pokemonDetails.innerText = `${pokemonInfo.name} | Level: ${pokemonInfo.level}`;
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
                                    pokemonInfo.name = nickname ? nickname : pokemonInfo.name; // Gebruik de ingevoerde bijnaam, anders behoud de originele naam
                                    pokemonInfo.captured = true;
                                    pokeballImage.src = "./assets/images/green_pokeball.png";
                                    alert(`Je hebt ${pokemonInfo.name} gevangen!`);

                                    // Roep de catchPokemon functie aan om de gevangen Pokémon naar de server te sturen
                                    catchPokemon(pokemonInfo);
                                } else {
                                    alert(`Je hebt ${pokemonInfo.name} niet kunnen vangen.`);
                                    // Verminder het aantal resterende pogingen en toon het aan de gebruiker
                                    pokemonInfo.remainingAttempts--;
                                    if (pokemonInfo.remainingAttempts === 0 && !pokemonInfo.captured) {
                                        alert("Je hebt geen pogingen meer over.");
                                    } else if (!pokemonInfo.captured) {
                                        alert(`Je hebt nog ${pokemonInfo.remainingAttempts} pogingen over.`);
                                    }
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
                        pokemonCard.appendChild(pokemonDetails); // Voeg de details toe
                        pokemonCard.appendChild(pokeballImage);
                        pokemonContainer.appendChild(pokemonCard);
                    });
            });
        });
};


function catchPokemon(pokemon) {
    fetch('/catchPokemon', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pokemon)
    })
        .then(response => response.text())
        .then(message => {
            alert(message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}