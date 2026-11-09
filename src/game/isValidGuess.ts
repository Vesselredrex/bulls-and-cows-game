import { createDigitValidator } from './createDigitValidator.js';

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

  const digits = [...guess.toLowerCase()];
  const validateDigit = createDigitValidator(base);

  const hasValidDigits = digits.every(validateDigit);
  const hasUniqueDigits = new Set(digits).size === digits.length;

  return hasValidDigits && hasUniqueDigits;
}
