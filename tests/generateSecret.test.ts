import { describe, expect, it } from 'vitest';
import { generateSecret } from '../src/game/generateSecret';

describe('generateSecret', () => {
  it('generates a secret of the requested length', () => {
    const secret = generateSecret(4, 10, () => 0);

    expect(secret).toHaveLength(4);
  });

  it('does not repeat digits', () => {
    const secret = generateSecret(6, 10, () => 0);

    expect(secret).toHaveLength(6);
    expect(new Set(secret).size).toBe(secret.length);
  });

  it.each([
    { base: 2, length: 2, allowed: /^[01]+$/ },
    { base: 8, length: 6, allowed: /^[0-7]+$/ },
    { base: 10, length: 6, allowed: /^[0-9]+$/ },
    { base: 16, length: 6, allowed: /^[0-9a-f]+$/i },
  ])('uses valid digits for base $base', ({ base, length, allowed }) => {
    const secret = generateSecret(length, base, () => 0);

    expect(secret).toHaveLength(length);
    expect(secret).toMatch(allowed);
  });

  it('allows a leading zero', () => {
    const secret = generateSecret(4, 10, () => 0);

    expect(secret.startsWith('0')).toBe(true);
  });

  it('produces predictable results with the same random generator', () => {
    const first = generateSecret(4, 10, () => 0);
    const second = generateSecret(4, 10, () => 0);

    expect(first).toHaveLength(4);
    expect(first).toBe(second);
  });
});
