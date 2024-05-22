document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".row g-3");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Voorkom standaard gedrag van het formulier

    const formData = new FormData(document.querySelector(".row g-3"));

    const email = formData.get("email");
    const password = formData.get("password");

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

          autoLogin: autoLogin === "on", // Convert checkbox value to boolean
        }),
      });

      if (response.ok) {
        const data = await response.json();
        prompt(data.message);
      } else {
        throw new Error("Er is iets misgegaan bij het registreren.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Er is iets misgegaan bij het registreren.");
    }
  });
});
async function updatePokemonStats(pokemonSection, pokemonName) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`
  );
  const pokemon = await response.json();

  const pokemonImg = document.getElementById(`${pokemonSection}-img`);
  const pokemonStats = document.getElementById(`${pokemonSection}-stats`);

  pokemonImg.src = pokemon.sprites.front_default;
  pokemonStats.querySelector(".pokemon-naam").textContent =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  const stats = pokemon.stats.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]'
  ).style.width = `${stats.hp}%`;
  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]:nth-of-type(2)'
  ).style.width = `${stats.attack}%`;
  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]:nth-of-type(3)'
  ).style.width = `${stats.defense}%`;
  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]:nth-of-type(4)'
  ).style.width = `${stats["special-attack"]}%`;
  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]:nth-of-type(5)'
  ).style.width = `${stats["special-defense"]}%`;
  pokemonStats.querySelector(
    '.progress-bar[aria-valuenow="0"][role="progressbar"]:nth-of-type(6)'
  ).style.width = `${stats.speed}%`;

  const totalStats = Object.values(stats).reduce(
    (acc, value) => acc + value,
    0
  );
  pokemonStats.querySelector(
    ".stats p"
  ).textContent = `Totale basisstatistieken: ${totalStats}`;
}
