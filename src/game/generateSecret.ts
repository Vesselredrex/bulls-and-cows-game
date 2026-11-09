export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random,
): string {
  if (
    ![2, 8, 10, 16].includes(base) ||
    !Number.isInteger(length) ||
    length < 2 ||
    length > 6 ||
    length > base
  ) {
    throw new RangeError('Invalid length or base');
  }

  const digits = '0123456789abcdef'.slice(0, base).split('');

  function selectDigits(available: string[], count: number): string {
    if (count === 0) {
      return '';
    }

    const index = Math.floor(random() * available.length);
    const selected = available[index];
    const remaining = available.filter((_, i) => i !== index);

    return selected + selectDigits(remaining, count - 1);
  }

  return selectDigits(digits, length);
}
