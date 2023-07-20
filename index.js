// Global Variables
let winningWord = '';
let currentRow = 1;
let guess = '';
let gamesPlayed = [];

// Query Selectors
const inputs = document.querySelectorAll('input');
const guessButton = document.querySelector('#guess-button');
const keyLetters = document.querySelectorAll('span');
const errorMessage = document.querySelector('#error-message');
const viewRulesButton = document.querySelector('#rules-button');
const viewGameButton = document.querySelector('#play-button');
const gameBoard = document.querySelector('#game-section');
const viewStatsButton = document.querySelector('#stats-button');
const letterKey = document.querySelector('#key-section');
const rules = document.querySelector('#rules-section');
const stats = document.querySelector('#stats-section');
const gameOverBox = document.querySelector('#game-over-section');
const gameOverMessage = document.querySelector('#game-over-message');
const gameOverGuessCount = document.querySelector('#game-over-guesses-count');
const gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');
const winningMessage = document.querySelector('.win');
const losingMessage = document.querySelector('.loss');
const winningWordElement = document.querySelector('#winning-word');

// Event Listeners
window.addEventListener('load', setGame);

for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  fetch('http://localhost:3001/api/v1/words')
    .then(resp => resp.json())
    .then(data => {
      // create global variable to be referenced elsewhere
      words = data;
      winningWord = getRandomWord(words);
    })
    .then(() => {
      currentRow = 1;
      updateInputPermissions();
    });
}

function getRandomWord(array) {
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function updateInputPermissions() {
  for (var i = 0; i < inputs.length; i++) {
    // currentRow has already been incremented here
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }
  const nextInput = document.querySelector(`#row-${currentRow} th :nth-child(1)`);
  nextInput.focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;

  // left arrow key functionality
  if (key === 37) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) - 1;
    inputs[indexOfNext].focus();
  } else if (key !== 8 && key !== 46) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareGameOutcome, 1000);
    } else if (!checkForWin() && currentRow === 6) {
      setTimeout(declareGameOutcome, 1000);
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  for (var i = 0; i < guessLetters.length; i++) {

    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

function updateBoxColor(letterLocation, className) {
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareGameOutcome() {
  recordGameStats(currentRow !== 6);
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}

function recordGameStats(solved) {
  gamesPlayed.push({ solved, guesses: currentRow });
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  gameOverMessage.innerText = 'Yay!';
  winningMessage.classList.remove('collapsed');
  losingMessage.classList.add('collapsed');
  
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
  
  if (currentRow === 6) {
    gameOverMessage.innerText = 'Oh no!';
    losingMessage.classList.remove('collapsed');
    winningMessage.classList.add('collapsed');
    winningWordElement.innerText = winningWord;
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

function clearKey() {
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
