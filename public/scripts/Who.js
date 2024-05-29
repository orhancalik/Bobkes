$(function () {
  $("#pokemonName").on("input", function () {
    var input = $(this).val().toLowerCase();
    if (input.length >= 2) {
      // Only make API request if at least 2 characters are entered
      $.ajax({
        url: "https://pokeapi.co/api/v2/pokemon?limit=1000",
        method: "GET",
        success: function (response) {
          var pokemonNames = response.results
            .map(function (pokemon) {
              return pokemon.name;
            })
            .filter(function (name) {
              return name.startsWith(input);
            })
            .slice(0, 3); // Get first 3 matching names
          var optionsHtml = pokemonNames
            .map(function (name) {
              return '<div class="autocompleteOption">' + name + "</div>";
            })
            .join("");
          $("#autocompleteOptions").html(optionsHtml);
        },
      });
    } else {
      $("#autocompleteOptions").empty(); // Clear suggestions if input is less than 2 characters
    }
  });

  $("#autocompleteOptions").on("click", ".autocompleteOption", function () {
    $("#pokemonName").val($(this).text());
    $("#autocompleteOptions").empty();
  });
});
