export function evaluateGuess(secret: string, guess: string): { bulls: number; cows: number } {
  const secretDigits = [...secret].map((digit) => digit.toLowerCase());

  const guessDigits = [...guess].map((digit) => digit.toLowerCase());

  const bulls = guessDigits.filter((digit, index) => digit === secretDigits[index]).length;

  const cows = guessDigits.reduce((count, digit, index) => {
    const isCow = digit !== secretDigits[index] && secretDigits.includes(digit);

    return count + (isCow ? 1 : 0);
  }, 0);

  return { bulls, cows };
}
