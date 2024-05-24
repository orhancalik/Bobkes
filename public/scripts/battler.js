async function updatePokemonStats(pokemonSection, pokemonName) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
  );
  const pokemon = await response.json();

  const pokemonImg = document.getElementById(`${pokemonSection}-img`);
  const pokemonNameElem = document.getElementById(`${pokemonSection}-name`);
  const hpElem = document.getElementById(`${pokemonSection}-hp`);
  const attackElem = document.getElementById(`${pokemonSection}-attack`);
  const defenseElem = document.getElementById(`${pokemonSection}-defense`);
  const specialAttackElem = document.getElementById(
    `${pokemonSection}-special-attack`
  );
  const specialDefenseElem = document.getElementById(
    `${pokemonSection}-special-defense`
  );
  const speedElem = document.getElementById(`${pokemonSection}-speed`);
  const totalStatsElem = document.getElementById(
    `${pokemonSection}-total-stats`
  );

  pokemonImg.src = pokemon.sprites.front_default;
  pokemonNameElem.textContent =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  const stats = pokemon.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  hpElem.style.width = `${stats.hp}%`;
  attackElem.style.width = `${stats.attack}%`;
  defenseElem.style.width = `${stats.defense}%`;
  specialAttackElem.style.width = `${stats["special-attack"]}%`;
  specialDefenseElem.style.width = `${stats["special-defense"]}%`;
  speedElem.style.width = `${stats.speed}%`;

  const totalStats = Object.values(stats).reduce(
    (acc, value) => acc + value,
    0
  );
  totalStatsElem.textContent = `Totale basisstatistieken: ${totalStats}`;
}
document.addEventListener("DOMContentLoaded", () => {
  const attackButtons = document.querySelectorAll(".attack-button");

  attackButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const pokemon1 = document.getElementById("pokemon1-select").value;
      const pokemon2 = document.getElementById("pokemon2-select").value;

      try {
        const response = await fetch("/pokemonbattle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pokemon1, pokemon2 }),
        });

        if (response.ok) {
          alert("Pokémon battle successful!");
        } else {
          alert("Er is een fout opgetreden bij de Pokémon battle.");
        }
      } catch (error) {
        console.error("Error during Pokémon battle:", error);
        alert("Er is een fout opgetreden bij de Pokémon battle.");
      }
    });
  });
});
