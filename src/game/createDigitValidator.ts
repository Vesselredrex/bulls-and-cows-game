export function createDigitValidator(base: number): (char: string) => boolean {
  if (![2, 8, 10, 16].includes(base)) {
    throw new RangeError('Unsupported number base');
  }

  const allowedDigits = '0123456789abcdef'.slice(0, base);

  return (char: string): boolean => {
    return char.length === 1 && allowedDigits.includes(char.toLowerCase());
  };
}
