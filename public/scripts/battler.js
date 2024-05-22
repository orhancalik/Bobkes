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
