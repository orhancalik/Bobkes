document.addEventListener('DOMContentLoaded', () => {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');

  favoriteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pokemonName = button.getAttribute('data-name');

      fetch('/setFavoritePokemon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: pokemonName })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Favoriete Pokémon ingesteld!');
            location.reload(); // Herlaad de pagina om de wijzigingen weer te geven
          } else {
            alert('Er is iets misgegaan bij het instellen van je favoriete Pokémon.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    });
  });
  const showAllPokemonCheckbox = document.getElementById('showAllPokemon');
  const allPokemonList = document.getElementById('allPokemonList');

  showAllPokemonCheckbox.addEventListener('change', function () {
    if (this.checked) {
      allPokemonList.classList.remove('hidden');
    } else {
      allPokemonList.classList.add('hidden');
    }
  });
});


