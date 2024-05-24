document.addEventListener("DOMContentLoaded", () => {
  const battleForm = document.getElementById("battleForm");
  const startBattleButton = document.getElementById("startBattle");
  const battleResultDiv = document.getElementById("battleResult");

  startBattleButton.addEventListener("click", async () => {
    const formData = new FormData(battleForm);
    const pokemon1 = formData.get("pokemon1");
    const pokemon2 = formData.get("pokemon2");

    const response = await fetch("/pokemonbattle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemon1, pokemon2 }),
    });

    const result = await response.json();
    battleResultDiv.innerHTML = `
      <h2>Battle Result</h2>
      <p>${result.message}</p>
      <div class="pokemon-container">
        <div class="pokemon">
          <h3>${result.currentPokemon1.name}</h3>
          <img src="${result.currentPokemon1.sprite}" alt="${result.currentPokemon1.name}">
          <p>HP: ${result.currentPokemon1.hp}</p>
        </div>
        <div class="pokemon">
          <h3>${result.currentPokemon2.name}</h3>
          <img src="${result.currentPokemon2.sprite}" alt="${result.currentPokemon2.name}">
          <p>HP: ${result.currentPokemon2.hp}</p>
        </div>
      </div>
    `;
  });
});
