const setup = () => {
    let firstCard = undefined;
    let secondCard = undefined;
    let isFlipping = false; // Flag to prevent flipping more than two cards at once
    let matchedCards = [];
    let clickCount = 0;
    let timerId;
    let seconds = 0;
  
    // Retrieve random Pokémon URLs from PokéAPI
    const getRandomPokemon = () => {
      const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
      const randomIds = [];
  
      while (randomIds.length < 12) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        if (!randomIds.includes(randomId)) {
          randomIds.push(randomId);
          randomIds.push(randomId); // Adding a matching pair
        }
      }
  
      const promises = randomIds.map((id) => {
        return $.getJSON(`${apiUrl}/${id}`);
      });
  
      Promise.all(promises)
        .then((results) => {
          const pokemonData = results.map((pokemon) => {
            if (pokemon.sprites.front_default) {
              return {
                id: pokemon.id,
                url: pokemon.sprites.front_default,
              };
            } else {
              return {
                id: pokemon.id,
                url: 'placeholder.png', // Placeholder image for Pokémon without a valid front image
              };
            }
          });
  
          initializeCards(pokemonData);
        })
        .catch((error) => {
          console.error('Error retrieving Pokémon:', error);
        });
    };
  
    // Initialize cards with random Pokémon images
    const initializeCards = (pokemonData) => {
      const cards = $(".card2");
      const shuffledCards = shuffleArray(cards.toArray());
  
      shuffledCards.forEach((card, index) => {
        const img = $(card).find(".front_face")[0];
        img.dataset.id = pokemonData[index].id; // Store Pokémon ID as a data attribute
        img.src = pokemonData[index].url;
      });
    };
  
    // Function to shuffle an array using Fisher-Yates algorithm
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
  
    // Card click event handler
    $(".card2").on("click", function () {
      if (isFlipping || $(this).hasClass("matched")) {
        // Ignore click if already flipping or card is already matched
        return;
      }
  
      const currentCard = this;
  
      if (currentCard === firstCard) {
        // Corner case 1: Clicked on the same card twice
        return;
      }
  
      if (firstCard && secondCard) {
        // Corner case 3: Two cards already flipped, do nothing
        return;
      }
  
      $(this).toggleClass("flip");
      clickCount++;
  
      if (!firstCard) {
        firstCard = currentCard;
      } else if (!secondCard) {
        secondCard = currentCard;
  
        const firstCardId = $(firstCard).find(".front_face")[0].dataset.id;
        const secondCardId = $(secondCard).find(".front_face")[0].dataset.id;
  
        if (firstCardId === secondCardId) {
          // Cards are the same, remove them from the game
          console.log("match");
  
          $(firstCard).parent().addClass("matched");
          $(secondCard).parent().addClass("matched");
  
          matchedCards.push(firstCard, secondCard);
  
          firstCard = undefined;
          secondCard = undefined;
  
          checkGameCompletion();
        } else {
          // Cards are not the same, flip them back with a delay
          console.log("no match");
  
          isFlipping = true;
  
          setTimeout(() => {
            $(firstCard).removeClass("flip");
            $(secondCard).removeClass("flip");
  
            firstCard = undefined;
            secondCard = undefined;
  
            isFlipping = false;
          }, 1000);
        }
      }
  
      updateHeader();
    });
  
    // Check if all cards have been matched and display winning message
    const checkGameCompletion = () => {
      const totalPairs = 6;
      const pairsMatched = matchedCards.length / 2;
    
      if (pairsMatched === totalPairs) {
        console.log("Game completed!");
        $(".message").text("Congratulations! You won the game!").addClass("game-over");
    
        // Disable the power-up button if needed
        $("#powerup-button").prop("disabled", true);
    
        // Stop the timer
        stopTimer();
    
        // Show the modal
        const modal = $("<div>").addClass("modal").appendTo("body");
        const message = $("<div>").text("You win!").addClass("modal-message");
        const button = $("<button>").text("OK").click(() => {
          modal.remove();
          resetGame();
        });
        modal.append(message, button);
      }
    };
    
    
    
      
  
    // Start the timer
const startTimer = () => {
  timerId = setInterval(() => {
    seconds++;
    $(".timer").text(`Time: ${seconds} seconds`);

    if (seconds >= 200) {
      gameTimeout();
    }
  }, 1000);
};

  
    // Stop the timer
    const stopTimer = () => {
      clearInterval(timerId);

    };
    

// Game timeout function
const gameTimeout = () => {
  stopTimer();
  $(".message").text("Time's up! Game over.").addClass("game-over");
  $(".card").off("click"); // Disable card click event handler

  const modal = $("<div>").addClass("modal").appendTo("body");
  const message = $("<div>").text("Time's up! Game over.").addClass("modal-message");
  const button = $("<button>").text("OK").click(() => {
    resetGame();
    modal.remove();
  });
  modal.append(message, button);
};

// Reset the game
const resetGame = () => {
  firstCard = undefined;
  secondCard = undefined;
  isFlipping = false;
  matchedCards = [];
  clickCount = 0;
  seconds = 0;
  startTimer();
  $(".timer").text("Time: 0 seconds");
  $(".card").removeClass("matched flip");
  $(".message").empty();
  $("#start-button").prop("disabled", false);
  getRandomPokemon();
  updateHeader();
};
    // Start button click event handler
$("#start-button").on("click", function () {
  startTimer();
  $(this).prop("disabled", true);
});

 // Reset button click event handler
 $("#reset-button").on("click", function () {
  stopTimer();
  resetGame();
});
  
    // Update header with click count and pair information
    const updateHeader = () => {
      const totalPairs = 6;
      const pairsMatched = matchedCards.length / 2;
      const pairsLeft = totalPairs - pairsMatched;
  
      $(".click-count").text(`Clicks: ${clickCount}`);
      $(".pairs-left").text(`Pairs Left: ${pairsLeft}`);
      $(".pairs-matched").text(`Pairs Matched: ${pairsMatched}`);
      $(".total-pairs").text(`Total Pairs: ${totalPairs}`);
    };
  
    // Theme selection event handler
    $("#theme").on("change", function () {
      const selectedTheme = $(this).val();
      $("body").removeClass().addClass(selectedTheme);
      $("h1").removeClass().addClass(selectedTheme);
      $(".card2").removeClass("light dark").addClass(selectedTheme);
    });
  
    // Default theme initialization
    $("body").addClass("light");
    $("h1").addClass("light");
    $(".card2").addClass("light");
  
    // Power-Up button click event handler
    $("#powerup-button").on("click", function () {
      // Disable the button to prevent multiple power-ups
      $(this).prop("disabled", true);
  
      // Flip all cards face up for a short period of time
      $(".card2").addClass("flip");
  
      // Wait for a few seconds and then flip the cards back
      setTimeout(() => {
        $(".card2").removeClass("flip");
        // Enable the button again after the power-up duration
        $(this).prop("disabled", false);
      }, 900); // Adjust the duration (in milliseconds) as desired
    });
  
    // Call getRandomPokemon to retrieve random Pokémon URLs
    getRandomPokemon();
   
    
       // Show the modal when the page is ready
  $("<div>")
  .addClass("modal")
  .appendTo("body")
  .text("Click OK to start the game")
  .append(
    $("<button>")
      .text("OK")
      .click(() => {
        // Start the game, remove the modal, and reset the game
        $(".modal").remove();
        resetGame(); 
      })
  );
};


  
  $(document).ready(setup);
  