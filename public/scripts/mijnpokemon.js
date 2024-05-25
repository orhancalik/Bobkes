document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('morePokemonBtn').addEventListener('click', loadMorePokemon);
  document.getElementById('allPokemonBtn').addEventListener('click', loadAllPokemon);
});

function loadMorePokemon() {
  // Fetch and append more Pokémon to the list
  // This is an example of how you might fetch data
  fetch('/api/morepokemon')
    .then(response => response.json())
    .then(pokemonList => {
      const pokedexList = document.getElementById('pokedexList');
      pokemonList.forEach(pokemon => {
        const pokemonItem = document.createElement('div');
        pokemonItem.classList.add('pokemon-item');
        pokemonItem.textContent = pokemon.name;
        pokemonItem.addEventListener('click', () => {
          window.location.href = `/pokemon/${pokemon.name}`;
        });
        pokedexList.appendChild(pokemonItem);
      });
    })
    .catch(error => console.error('Error fetching more Pokémon:', error));
}

function loadAllPokemon() {
  // Similar implementation as loadMorePokemon but fetches all Pokémon
}
