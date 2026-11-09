import { createDigitValidator } from './createDigitValidator';

export function isValidGuess(guess: string, length: number, base: number): boolean {
  if (
    ![2, 8, 10, 16].includes(base) ||
    !Number.isInteger(length) ||
    length < 2 ||
    length > 6 ||
    length > base ||
    guess.length !== length
  ) {
    return false;
  }

  const isValidDigit = createDigitValidator(base);
  const normalizedGuess = guess.toLowerCase();

  return [...normalizedGuess].every(isValidDigit) && new Set(normalizedGuess).size === length;
}
