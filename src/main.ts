import { generateSecret } from './game/generateSecret.js';
import { isValidGuess } from './game/isValidGuess.js';
import { evaluateGuess } from './game/evaluateGuess.js';

const heading = document.createElement('h1');
heading.textContent = 'Bulls and Cows';

const settings = document.createElement('section');

const baseLabel = document.createElement('label');
baseLabel.textContent = 'Number system: ';
baseLabel.htmlFor = 'base';

const baseSelect = document.createElement('select');
baseSelect.id = 'base';

const bases = [
  { value: '2', text: 'Binary (2)' },
  { value: '8', text: 'Octal (8)' },
  { value: '10', text: 'Decimal (10)' },
  { value: '16', text: 'Hexadecimal (16)' },
];

bases.forEach(({ value, text }) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  baseSelect.append(option);
});

baseSelect.value = '10';

const lengthLabel = document.createElement('label');
lengthLabel.textContent = 'Secret length: ';
lengthLabel.htmlFor = 'length';

const lengthSelect = document.createElement('select');
lengthSelect.id = 'length';

[2, 3, 4, 5, 6].forEach((length) => {
  const option = document.createElement('option');
  option.value = String(length);
  option.textContent = String(length);
  lengthSelect.append(option);
});

lengthSelect.value = '4';

baseSelect.addEventListener('change', () => {
  const base = Number(baseSelect.value);

  [...lengthSelect.options].forEach((option) => {
    option.disabled = Number(option.value) > base;
  });

  if (Number(lengthSelect.value) > base) {
    lengthSelect.value = '2';
  }
});

type GuessEntry = Readonly<{
  guess: string;
  bulls: number;
  cows: number;
}>;

type GameState = Readonly<{
  secret: string;
  length: number;
  base: number;
  history: readonly GuessEntry[];
  startedAt: number;
}>;

let gameState: GameState | null = null;

const startButton = document.createElement('button');
startButton.type = 'button';
startButton.textContent = 'Start Game';

const gameStatus = document.createElement('p');

const newGameButton = document.createElement('button');
newGameButton.type = 'button';
newGameButton.textContent = 'New Game';
newGameButton.hidden = true;

const guessLabel = document.createElement('label');
guessLabel.textContent = 'Your guess: ';
guessLabel.htmlFor = 'guess';

const guessInput = document.createElement('input');
guessInput.id = 'guess';
guessInput.type = 'text';
guessInput.autocomplete = 'off';
guessInput.disabled = true;

const guessButton = document.createElement('button');
guessButton.type = 'button';
guessButton.textContent = 'Check Guess';
guessButton.disabled = true;

const guessResult = document.createElement('p');
guessResult.setAttribute('aria-live', 'polite');

const historyHeading = document.createElement('h2');
historyHeading.textContent = 'Guess history';

const historyList = document.createElement('ol');

const attemptsInfo = document.createElement('p');
attemptsInfo.textContent = 'Attempts: 0';

const timerInfo = document.createElement('p');
timerInfo.textContent = 'Elapsed: 0s';

let timerId: number | null = null;

function updateTimer(): void {
  if (gameState === null) {
    return;
  }

  const elapsedSeconds = Math.floor((Date.now() - gameState.startedAt) / 1000);

  timerInfo.textContent = `Elapsed: ${elapsedSeconds}s`;
}

startButton.addEventListener('click', () => {
  if (gameState !== null) {
    return;
  }

  const base = Number(baseSelect.value);
  const length = Number(lengthSelect.value);

  gameState = {
    secret: generateSecret(length, base),
    length,
    base,
    history: [],
    startedAt: Date.now(),
  };

  updateTimer();
  timerId = window.setInterval(updateTimer, 1000);

  baseSelect.disabled = true;
  lengthSelect.disabled = true;
  startButton.disabled = true;
  newGameButton.hidden = false;
  guessInput.disabled = false;
  guessButton.disabled = false;
  guessInput.maxLength = length;
  guessInput.focus();

  gameStatus.textContent = `Game started! Guess the ${length}-digit secret (base ${base}).`;
});

guessButton.addEventListener('click', () => {
  const currentGame = gameState;

  if (currentGame === null) {
    return;
  }

  const guess = guessInput.value.toLowerCase();

  if (!isValidGuess(guess, currentGame.length, currentGame.base)) {
    guessResult.textContent = 'Invalid guess. Check length, digits and duplicates.';
    return;
  }

  const alreadyGuessed = currentGame.history.some((entry) => entry.guess === guess);

  if (alreadyGuessed) {
    guessResult.textContent = 'You have already tried this combination.';
    return;
  }

  const result = evaluateGuess(currentGame.secret, guess);

  const entry: GuessEntry = {
    guess,
    bulls: result.bulls,
    cows: result.cows,
  };

  const updatedGame: GameState = {
    ...currentGame,
    history: [...currentGame.history, entry],
  };

  gameState = updatedGame;

  historyList.replaceChildren(
    ...updatedGame.history.map((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${item.guess} — Bulls: ${item.bulls}, Cows: ${item.cows}`;
      return listItem;
    }),
  );

  attemptsInfo.textContent = `Attempts: ${updatedGame.history.length}`;
  guessResult.textContent = `Bulls: ${result.bulls} | Cows: ${result.cows}`;

  guessInput.value = '';

  if (result.bulls === currentGame.length) {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }

    updateTimer();

    gameStatus.textContent = 'Congratulations! You guessed the secret!';
    guessInput.disabled = true;
    guessButton.disabled = true;
  }
});

newGameButton.addEventListener('click', () => {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }

  gameState = null;

  baseSelect.disabled = false;
  lengthSelect.disabled = false;
  startButton.disabled = false;
  newGameButton.hidden = true;

  guessInput.value = '';
  guessInput.disabled = true;
  guessButton.disabled = true;

  guessResult.textContent = '';
  historyList.replaceChildren();

  attemptsInfo.textContent = 'Attempts: 0';
  timerInfo.textContent = 'Elapsed: 0s';

  gameStatus.textContent = 'Choose settings and press Start Game.';
});

settings.append(baseLabel, baseSelect, lengthLabel, lengthSelect, startButton, newGameButton);
document.body.append(
  heading,
  settings,
  gameStatus,
  guessLabel,
  guessInput,
  guessButton,
  guessResult,
  historyHeading,
  historyList,
  attemptsInfo,
  timerInfo,
);
