import { describe, expect, it } from 'vitest';
import { evaluateGuess } from '../src/game/evaluateGuess';

describe('evaluateGuess', () => {
  it('counts four bulls for an exact match', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({
      bulls: 4,
      cows: 0,
    });
  });

  it('counts four cows when all digits are misplaced', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({
      bulls: 0,
      cows: 4,
    });
  });

  it('counts both bulls and cows', () => {
    expect(evaluateGuess('1234', '1526')).toEqual({
      bulls: 1,
      cows: 1,
    });
  });

  it('returns zero when no digits match', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({
      bulls: 0,
      cows: 0,
    });
  });

  it('ignores letter case in hexadecimal digits', () => {
    expect(evaluateGuess('a1f0', 'A10F')).toEqual({
      bulls: 2,
      cows: 2,
    });
  });

  it('counts a single bull correctly', () => {
    expect(evaluateGuess('1234', '1567')).toEqual({
      bulls: 1,
      cows: 0,
    });
  });

  it('handles a secret with a leading zero', () => {
    expect(evaluateGuess('0123', '1024')).toEqual({
      bulls: 1,
      cows: 2,
    });
  });
});
