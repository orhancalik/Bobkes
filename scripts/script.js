const pokemon1Stats = {
    hp: 100,
    attack: 20,
    defense: 15
  };
  
  const pokemon2Stats = {
    hp: 100,
    attack: 18,
    defense: 12
  };
  
  // Functie om het gevecht te starten
  function startBattle() {
    alert("Het gevecht begint!");
  }
  
  // Functie om aan te vallen
  function pokemonAttack() {
    // Bereken de schade
    const damage = pokemon1Stats.attack - pokemon2Stats.defense;
    
    // Verminder de HP van Pokémon 2
    pokemon2Stats.hp -= damage;
    
    // Controleer of Pokémon 2 nog leeft
    if (pokemon2Stats.hp <= 0) {
      alert("Pokemon 1 wint!");
    }
  }
