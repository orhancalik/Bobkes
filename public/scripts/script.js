<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector(".register-form");
  
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Voorkom standaard gedrag van het formulier
  
      const formData = new FormData(registerForm); // Verzamel formuliergegevens
  
      const email = formData.get("email");
      const password = formData.get("password");
      const address = formData.get("address");
      const address2 = formData.get("address2");
      const city = formData.get("city");
      const state = formData.get("state");
      const zip = formData.get("zip");
      const autoLogin = formData.get("autoLogin");
  
      // Verstuur formuliergegevens naar de server via een POST-verzoek
      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            address,
            address2,
            city,
            state,
            zip,
            autoLogin: autoLogin === "on", // Convert checkbox value to boolean
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          alert(data.message); // Toon een melding met de respons van de server
        } else {
          throw new Error("Er is iets misgegaan bij het registreren.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Er is iets misgegaan bij het registreren.");
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", async function () {
    // Haal de URL van de Pokemon op
    const pokemonURL = "https://pokeapi.co/api/v2/pokemon/bulbasaur";
    
    try {
      // Haal de gegevens van de Pokemon op
      const response = await fetch(pokemonURL);
      const data = await response.json();
  
      // Haal de afbeeldings-URL op
      const imageUrl = data.sprites.front_default;
  
      // Laad de afbeelding in
      const pokemonImage = document.getElementById("pokemonImage");
      pokemonImage.src = imageUrl;
    } catch (error) {
      console.error("Error:", error);
    }
  });
    
=======
// Functie om de gegevens van een specifieke Pokémon op te halen
async function fetchPokemonData(pokemonName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Pokémon niet gevonden');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      alert('Er is een fout opgetreden bij het ophalen van de Pokémon-gegevens.');
    }
  }
  
  // Functie om de DOM bij te werken met de gegevens van de Pokémon
function updatePokemonInfo(pokemonData, containerId) {
  const container = document.getElementById(containerId);
  if (container && pokemonData) {
      container.querySelector('.pok').src = pokemonData.sprites.front_default;
      container.querySelector('.pokemon-naam').textContent = pokemonData.name;
      
      // Voeg hier extra logica toe om andere statistieken bij te werken
      const statsMenu = container.querySelector('.statsmenu');
      statsMenu.innerHTML = ''; // Wis de huidige inhoud

      // Voeg elke statistiek toe aan de statsmenu
      pokemonData.stats.forEach(stat => {
          const statElement = document.createElement('p');
          statElement.textContent = `${stat.stat.name}: ${stat.base_stat}`;
          statsMenu.appendChild(statElement);
      });
  }
}
// Functie om te controleren of een statistiek hoger is dan de rest
function isStatHigher(stat, allStats) {
  // Vergelijk de huidige statistiek met alle andere statistieken
  return allStats.every(otherStat => {
      // Sla de vergelijking over voor dezelfde statistiek
      if (otherStat.stat.name === stat.stat.name) return true;

      // Controleer of de huidige statistiek hoger is dan de andere
      return stat.base_stat > otherStat.base_stat;
  });
}
  
  
  // Event listeners voor de knoppen
  document.getElementById('choose-pokemon1-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon1');
    }
});

document.getElementById('random-pokemon1-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon1');
});

document.getElementById('choose-pokemon2-btn').addEventListener('click', async () => {
    const pokemonName = prompt('Voer de naam van een Pokémon in:');
    if (pokemonName) {
        const pokemonData = await fetchPokemonData(pokemonName);
        updatePokemonInfo(pokemonData, 'pokemon2');
    }
});

document.getElementById('random-pokemon2-btn').addEventListener('click', async () => {
    const randomPokemonData = await fetchRandomPokemon();
    updatePokemonInfo(randomPokemonData, 'pokemon2');
});
>>>>>>> refs/remotes/origin/main
