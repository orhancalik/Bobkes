$(function () {
  $("#pokemonName").on("input", function () {
    var input = $(this).val().toLowerCase();
    if (input.length >= 2) {
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
            .slice(0, 3); 
          var optionsHtml = pokemonNames
            .map(function (name) {
              return '<div class="autocompleteOption">' + name + "</div>";
            })
            .join("");
          $("#autocompleteOptions").html(optionsHtml);
        },
      });
    } else {
      $("#autocompleteOptions").empty(); 
    }
  });

  $("#autocompleteOptions").on("click", ".autocompleteOption", function () {
    $("#pokemonName").val($(this).text());
    $("#autocompleteOptions").empty();
  });

  $("#guessForm").on("submit", function (event) {
    event.preventDefault();
    var enteredName = $("#pokemonName").val().toLowerCase();
    var correctName = $("input[name='correctName']").val().toLowerCase();

    if (enteredName === correctName) {
      alert("Gefeliciteerd, gewonnen!");
      $("#blurry").css("filter", "none");  
    } else {
      alert("Helaas, probeer het opnieuw!");
    }
  });

  $("#random-pokemon2-btn").on("click", function () {
    location.reload(); 
  });
});
