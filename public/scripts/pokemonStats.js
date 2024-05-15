document.addEventListener("DOMContentLoaded", async function () {
    const pokemonDetail = document.getElementById("pokemonDetail");
    const pokemonName = window.location.pathname.split("/").pop(); // Haal de naam van de Pokémon uit de URL
    
    async function fetchPokemonStats(pokemonName) {
      if (!pokemonName) {
        console.error('Geen Pokémon-naam opgegeven.');
        return;
      }
    
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
        alert(`Error fetching Pokémon stats: ${error.message}`);
      }
    }
    
    
  
    async function displayPokemonStats() {
      try {
        const pokemonStats = await fetchPokemonStats(pokemonName);
  
        // Vul de informatie in op de pagina
        const naamPokemonStats = document.getElementById("naampokemonstats");
        const Pokemonstatspicture = document.getElementById("Pokemonstatspicture").getElementsByTagName("img")[0];
        
        naamPokemonStats.textContent = pokemonStats.name;
        Pokemonstatspicture.src = pokemonStats.sprites.front_default;
  
        // Vul de statistieken in
        const stats = document.querySelectorAll(".progress-bar");
        stats[0].style.width = `${pokemonStats.stats[0].base_stat}%`; // HP
        stats[0].textContent = `HP: ${pokemonStats.stats[0].base_stat}`;
        stats[1].style.width = `${pokemonStats.stats[1].base_stat}%`; // Aanval
        stats[1].textContent = `Aanval: ${pokemonStats.stats[1].base_stat}`;
        stats[2].style.width = `${pokemonStats.stats[2].base_stat}%`; // Verdediging
        stats[2].textContent = `Verdediging: ${pokemonStats.stats[2].base_stat}`;
        stats[3].style.width = `${pokemonStats.stats[3].base_stat}%`; // Speciale Aanval
        stats[3].textContent = `Speciale Aanval: ${pokemonStats.stats[3].base_stat}`;
        stats[4].style.width = `${pokemonStats.stats[4].base_stat}%`; // Speciale Verdediging
        stats[4].textContent = `Speciale Verdediging: ${pokemonStats.stats[4].base_stat}`;
        stats[5].style.width = `${pokemonStats.stats[5].base_stat}%`; // Snelheid
        stats[5].textContent = `Snelheid: ${pokemonStats.stats[5].base_stat}`;
      } catch (error) {
        console.error("Er is een fout opgetreden bij het tonen van de Pokémon stats:", error);
      }
    }
  
    await displayPokemonStats();
  });
  