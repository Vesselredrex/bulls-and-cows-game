import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from '../src/game/countPossibleSecrets';

describe('countPossibleSecrets', () => {
  it('counts binary combinations', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('counts octal combinations', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
  });

  it('counts decimal combinations', () => {
    expect(countPossibleSecrets(4, 10)).toBe(5040);
  });

  it('counts hexadecimal combinations', () => {
    expect(countPossibleSecrets(4, 16)).toBe(43680);
  });

  it('includes combinations with a leading zero', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
  });

  it('counts six-digit decimal combinations', () => {
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('counts six-digit hexadecimal combinations', () => {
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });

  it('returns consistent results for repeated calls', () => {
    const first = countPossibleSecrets(6, 8);
    const second = countPossibleSecrets(6, 8);

    expect(first).toBe(20160);
    expect(second).toBe(first);
  });

  it('rejects unsupported number bases', () => {
    expect(() => countPossibleSecrets(4, 3)).toThrow(RangeError);
  });

  it('rejects invalid lengths', () => {
    expect(() => countPossibleSecrets(1, 10)).toThrow(RangeError);
    expect(() => countPossibleSecrets(7, 10)).toThrow(RangeError);
    expect(() => countPossibleSecrets(3, 2)).toThrow(RangeError);
  });
});
