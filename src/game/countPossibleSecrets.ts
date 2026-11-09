const memo = new Map<string, number>();

function permutations(available: number, positions: number): number {
  if (positions === 0) {
    return 1;
  }

  const key = `${available}:${positions}`;
  const cached = memo.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const result = available * permutations(available - 1, positions - 1);

  memo.set(key, result);

  return result;
}

export function countPossibleSecrets(length: number, base: number): number {
  if (
    ![2, 8, 10, 16].includes(base) ||
    !Number.isInteger(length) ||
    length < 2 ||
    length > 6 ||
    length > base
  ) {
    throw new RangeError('Invalid length or base');
  }

  return permutations(base, length);
}
