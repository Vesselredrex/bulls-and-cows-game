import './style.css';

import { generateSecret } from './game/generateSecret.js';
import { isValidGuess } from './game/isValidGuess.js';
import { evaluateGuess } from './game/evaluateGuess.js';
import { getTopScores, loadHighScores, saveHighScore } from './game/highScores.js';

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

const highScoresHeading = document.createElement('h2');
highScoresHeading.textContent = 'High Scores';

const highScoresList = document.createElement('ol');

const highScoresMessage = document.createElement('p');

function renderHighScores(): void {
  const base = Number(baseSelect.value);
  const length = Number(lengthSelect.value);

  const scores = getTopScores(loadHighScores(), base, length);

  const items = scores.map((score) => {
    const item = document.createElement('li');
    item.className = 'high-score-entry';

    const attempts = document.createElement('strong');
    attempts.textContent = `${score.attempts} ${score.attempts === 1 ? 'attempt' : 'attempts'}`;

    const time = document.createElement('span');
    time.className = 'high-score-time';
    time.textContent = `${score.elapsedSeconds}s`;

    item.append(attempts, time);

    return item;
  });

  highScoresList.replaceChildren(...items);

  highScoresMessage.textContent =
    scores.length === 0
      ? 'No records yet for these settings.'
      : `Best results for base ${base}, length ${length}`;
}

baseSelect.addEventListener('change', renderHighScores);
lengthSelect.addEventListener('change', renderHighScores);

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
      listItem.className = 'history-entry';

      const guessValue = document.createElement('strong');
      guessValue.className = 'guess-value';
      guessValue.textContent = item.guess.toUpperCase();

      const bullsTag = document.createElement('span');
      bullsTag.className = 'result-tag result-tag--bulls';
      bullsTag.textContent = `Bulls: ${item.bulls}`;

      const cowsTag = document.createElement('span');
      cowsTag.className = 'result-tag result-tag--cows';
      cowsTag.textContent = `Cows: ${item.cows}`;

      listItem.append(guessValue, bullsTag, cowsTag);

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

    const elapsedSeconds = Math.floor((Date.now() - currentGame.startedAt) / 1000);

    const saved = saveHighScore({
      base: currentGame.base,
      length: currentGame.length,
      attempts: updatedGame.history.length,
      elapsedSeconds,
      completedAt: new Date().toISOString(),
    });

    renderHighScores();

    gameStatus.textContent = saved
      ? 'Congratulations! Your result has been saved!'
      : 'Congratulations! You won, but your result could not be saved.';

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

const main = document.createElement('main');
main.className = 'game-layout';

const playPanel = document.createElement('div');
playPanel.className = 'panel play-panel';

const guessControls = document.createElement('div');
guessControls.className = 'guess-controls';

guessControls.append(guessLabel, guessInput, guessButton);
playPanel.append(gameStatus, guessControls, guessResult);

const historyPanel = document.createElement('div');
historyPanel.className = 'panel';

const stats = document.createElement('div');
stats.className = 'game-stats';

stats.append(attemptsInfo, timerInfo);
historyPanel.append(historyHeading, stats, historyList);

const scoresPanel = document.createElement('div');
scoresPanel.className = 'panel';

scoresPanel.append(highScoresHeading, highScoresMessage, highScoresList);

main.append(playPanel, historyPanel, scoresPanel);

document.body.append(heading, settings, main);

renderHighScores();
