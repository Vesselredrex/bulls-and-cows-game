# Bulls and Cows — Design Documentation

## 1. Project Overview

Bulls and Cows is a browser-based number guessing game
developed with TypeScript, Vite, and the DOM API.

The player attempts to guess a randomly generated secret
consisting of unique digits.

## 2. Technology Stack

- TypeScript
- Vite
- HTML5 and CSS3
- Vitest
- ESLint and Prettier
- Husky and lint-staged
- Browser localStorage

## 3. Game Rules

- Supported number bases: 2, 8, 10, and 16.
- Supported secret lengths: 2–6 digits.
- Binary secrets have a maximum length of 2.
- Digits cannot repeat within a secret or guess.
- Leading zeros are allowed.
- Hexadecimal input is case-insensitive.
- Bulls represent correct digits in correct positions.
- Cows represent correct digits in incorrect positions.
- The player wins when all digits are Bulls.
- Repeated guesses are rejected.

## 4. Application Architecture

### Game Logic

The game algorithms are located in `src/game/`.

### User Interface

The interactive interface is implemented in `src/main.ts`.

The responsive visual design is implemented in `src/style.css`.

### DOM Architecture

**Source:** `src/main.ts`, lines 322–354.

The user interface is constructed dynamically using
the native browser DOM API.

The application consists of:

1. Game settings — number base, secret length,
   Start Game and New Game buttons.
2. Play panel — guess input, validation feedback,
   and the Check Guess button.
3. Guess history panel — previous guesses,
   Bulls and Cows results, attempt counter, and timer.
4. High Scores panel — the best saved results
   for the selected game configuration.

The panels are placed inside a main container
using `append()` (lines 324–352).

Saved high scores are rendered when the application
initializes (line 354).

The interface does not use `innerHTML` or
`insertAdjacentHTML`.

Responsive layout and visual styling are defined
in `src/style.css`.

### Data Persistence

High scores are stored in browser localStorage.

Results are ranked by the number of attempts,
followed by completion time.

## 5. Algorithms and Complexity

### 5.1. Secret Generation — `generateSecret()`

**Source:** `src/game/generateSecret.ts`, lines 1–31.

**Purpose:** Generates a random secret containing unique digits
from the selected number system.

**Algorithm:**

1. Validate the requested base and secret length (lines 6–14).
2. Create an array of allowed digits for the selected base (line 16).
3. Randomly select a digit from the available digits (line 23).
4. Create a new array without the selected digit (line 25).
5. Recursively select the remaining digits until the required
   secret length is reached (lines 18–28).
6. Return the completed secret (line 30).

Removing each selected digit prevents duplicates.
Leading zeros are allowed.

The random number generator can be injected as a parameter,
allowing deterministic unit tests.

**Time Complexity:** O(b × L)

Each recursive step filters the remaining available digits.
The total work is proportional to the number of digits in the
base multiplied by the requested secret length.

**Space Complexity:** O(b × L)

Recursive calls retain arrays of available digits.
The recursion stack requires O(L) additional space.

Here, `b` is the number base and `L` is the secret length.

### 5.2. Guess Evaluation — `evaluateGuess()`

**Source:** `src/game/evaluateGuess.ts`, lines 1–15.

**Purpose:** Calculates the number of Bulls and Cows for a
player's guess.

**Algorithm:**

1. Convert the secret and guess into lowercase character
   arrays (lines 2–4).
2. Compare digits at matching positions to count Bulls
   (line 6).
3. Iterate through the guessed digits (lines 8–12).
4. Count a Cow when a digit exists in the secret but is
   located at a different position (line 9).
5. Return the Bulls and Cows counts (line 14).

The function assumes that the secret and guess have equal
lengths and contain unique digits. Input validation is
performed separately.

**Time Complexity:** O(L²)

The algorithm uses `includes()` inside `reduce()`.
Each search may examine up to L secret digits, and the
reduction iterates through L guessed digits.

**Space Complexity:** O(L)

Two character arrays are created to store the lowercase
secret and guessed digits.

Here, `L` is the length of the secret and guess.

Although O(L²) is higher than O(L), it is not a practical
concern for this game because the secret length is limited
to six characters. The algorithm could be optimized using a
`Set`, but the current implementation is simple and sufficient.

### 5.3. Digit Validation — `createDigitValidator()`

**Source:** `src/game/createDigitValidator.ts`, lines 1–11.

**Purpose:** Creates a reusable character validator for a
specified number base.

**Algorithm:**

1. Validate that the number base is supported (lines 2–4).
2. Create a string of allowed digits for the selected
   base (line 6).
3. Return a validator function that checks whether the
   input contains exactly one character (lines 8–10).
4. Convert the character to lowercase and verify that
   it is included in the allowed digits (line 9).

**Functional Programming Concept — Closure:**

The returned function retains access to the `allowedDigits`
variable from its surrounding lexical scope.

This allows multiple characters to be validated without
recreating the allowed digit set for every call.

**Time Complexity:**

- Validator creation: O(b).
- Single-character validation: O(b).

The `includes()` method may search through up to b
allowed characters.

**Space Complexity:** O(b)

The closure retains the allowed digit string.

Here, `b` represents the selected number base.

### 5.4. Guess Validation — `isValidGuess()`

**Source:** `src/game/isValidGuess.ts`, lines 1–22.

**Purpose:** Validates a player's guess against the game
rules before it is evaluated.

**Algorithm:**

1. Validate the selected number base and secret length
   (lines 4–13).
2. Check that the guess has the required length
   (line 10).
3. Convert the guess to a lowercase character array
   (line 15).
4. Create a digit validator for the selected base
   (line 16).
5. Verify that all characters are valid using `every()`
   (line 18).
6. Check that all digits are unique using a `Set`
   (line 19).
7. Return true only if both digit validation and
   uniqueness checks succeed (line 21).

**Time Complexity:** O(b + L × b)

Creating the digit validator requires O(b) time.
Validating L characters requires O(L × b) time because
each character validation may search up to b allowed digits.
The Set construction takes O(L) expected time.

For the supported bases, b is bounded by 16, making
the effective complexity linear in L.

**Space Complexity:** O(L + b)

The function creates a lowercase character array,
a Set of unique digits, and a digit validator that
retains the allowed digit string.

Here, `L` represents the guess length and `b` represents
the selected number base.

### 5.5. Counting Possible Secrets — `countPossibleSecrets()`

**Source:** `src/game/countPossibleSecrets.ts`, lines 1–34.

**Purpose:** Calculates the number of possible secret
combinations for the selected base and length without
repeated digits.

**Algorithm:**

1. Create a Map to cache previously calculated results
   (line 1).
2. Define a recursive permutation function (lines 3–20).
3. Return 1 when no positions remain (lines 4–6).
4. Generate a unique cache key using the number of
   available digits and remaining positions (line 8).
5. Return a cached result when available (lines 9–13).
6. Otherwise, calculate the number of permutations
   recursively (line 15).
7. Store the calculated result in the cache (line 17).
8. Validate the requested base and length (lines 23–31).
9. Return the number of possible secrets (line 33).

**Mathematical Formula:**

P(b, L) = b! / (b - L)!

Here, b represents the number base and L represents
the secret length.

For example, with base 8 and length 3:

P(8, 3) = 8 × 7 × 6 = 336.

**Optimization — Memoization:**

A Map stores previously computed permutation counts.

When the same calculation is requested again, the
cached result can be returned without repeating
the recursive calls.

**Time Complexity:**

- Uncached calculation: O(L).
- Cached calculation: O(1) expected time.

The recursion reduces the number of remaining positions
by one during each call.

**Space Complexity:** O(L) additional space for an
uncached calculation.

The recursive call stack and newly cached intermediate
results require up to O(L) space. The module-level
cache persists across function calls.

## 6. State Management

The application manages the current game using a
TypeScript `GameState` object.

**Source:** `src/main.ts`, lines 64–78.

### 6.1. Game State Structure

The `GameState` type contains:

- `secret`: The generated secret combination.
- `length`: The selected secret length.
- `base`: The selected number base.
- `history`: A readonly array of previous guesses.
- `startedAt`: The timestamp when the game started.

Each history entry contains:

- `guess`: The submitted combination.
- `bulls`: Number of correctly positioned digits.
- `cows`: Number of correct digits in incorrect positions.

The game state is initially `null`, representing
the absence of an active game.

### 6.2. Immutability

The application uses TypeScript's `Readonly` types
to discourage direct mutation of game data.

When a new valid guess is submitted, the application
creates a new history array using spread syntax
rather than modifying the existing array.

A new state object can then replace the previous one.

TypeScript's `Readonly` provides compile-time
protection and does not freeze objects at runtime.

### 6.3. Timer Management

**Source:** `src/main.ts`, lines 122–130.

The game stores its start time as a timestamp.

Elapsed time is calculated using the difference
between the current timestamp and `startedAt`.

The displayed time is measured in whole seconds.

### 6.4. High Score Rendering

**Source:** `src/main.ts`, lines 139–167.

High scores are persisted separately from the
current game state using browser localStorage.

The interface loads saved scores, filters them
by the selected base and length, and creates
DOM elements to display the results.

The interface uses DOM APIs rather than `innerHTML`.

### 6.5. Starting a Game

**Source:** `src/main.ts`, lines 172–201.

When the player clicks Start Game:

1. The application checks whether a game already exists.
2. The selected number base and secret length are read.
3. A new secret is generated using `generateSecret()`.
4. A new `GameState` object is created with an empty history.
5. The start timestamp is recorded using `Date.now()`.
6. The timer starts updating every second.
7. The settings are disabled for the current round.
8. The guess input and Check Guess button are enabled.

### 6.6. Processing a Guess

**Source:** `src/main.ts`, lines 203–294.

When a guess is submitted:

1. Check whether a game exists (lines 204–208).
2. Convert the input to lowercase (line 210).
3. Validate the guess using `isValidGuess()` (lines 212–215).
4. Reject previously submitted combinations (lines 217–222).
5. Calculate Bulls and Cows using `evaluateGuess()` (line 224).
6. Create a new `GuessEntry` (lines 226–230).
7. Create a new history array and `GameState` object (lines 232–237).
8. Update the displayed history using DOM methods (lines 239–260).
9. Update the attempts counter and result (lines 262–263).

**Win Condition:** `src/main.ts`, lines 267–293.

The player wins when the number of Bulls equals the secret length.

After winning, the application stops the timer, calculates the
elapsed time, saves the result to localStorage, refreshes the
high scores, and disables further guesses.

### 6.7. Resetting the Game

**Source:** `src/main.ts`, lines 296–320.

The New Game button resets the current round without reloading
the browser page.

The application:

1. Stops the active timer.
2. Resets `gameState` to `null`.
3. Re-enables the game settings and Start Game button.
4. Clears the input, feedback, and guess history.
5. Resets the attempt counter and elapsed time.
6. Allows the player to start a new round.

Previously saved high scores remain available in localStorage.

### 6.8. Functional Programming Principles

The implementation follows these principles:

- Core game algorithms are separated from the DOM interface.
- Functions receive explicit parameters.
- Game history is updated without modifying existing arrays.
- Object and array spread syntax creates new state values.
- TypeScript `Readonly` types discourage direct mutation.
- Browser elements are created using the DOM API.
- The application avoids `innerHTML` and `insertAdjacentHTML`.

## 7. Testing Strategy

The project uses Vitest for automated testing.

The current test suite contains 59 tests across six files.

Git hooks run staged-file checks before commits
and automated tests before pushes.

## 8. Build and Development

Install dependencies:

`npm install`

Start the development server:

`npm run dev`

Run automated tests:

`npm test`

Run the linter:

`npm run lint`

Create a production build:

`npm run build`
