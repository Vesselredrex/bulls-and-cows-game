import { describe, expect, it } from 'vitest';
import { isValidGuess } from '../src/game/isValidGuess';

describe('isValidGuess', () => {
  it('accepts a valid decimal guess', () => {
    expect(isValidGuess('1234', 4, 10)).toBe(true);
  });

  it('accepts a leading zero', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('accepts a valid binary guess', () => {
    expect(isValidGuess('01', 2, 2)).toBe(true);
  });

  it('accepts a valid octal guess', () => {
    expect(isValidGuess('7012', 4, 8)).toBe(true);
  });

  it('accepts hexadecimal letters in either case', () => {
    expect(isValidGuess('aF09', 4, 16)).toBe(true);
  });

  it('rejects an incorrect length', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
  });

  it('rejects repeated digits', () => {
    expect(isValidGuess('1123', 4, 10)).toBe(false);
  });

  it('rejects repeated hexadecimal letters ignoring case', () => {
    expect(isValidGuess('aA12', 4, 16)).toBe(false);
  });

  it('rejects digits outside the selected base', () => {
    expect(isValidGuess('1284', 4, 8)).toBe(false);
  });

  it('rejects spaces and invalid characters', () => {
    expect(isValidGuess('12 4', 4, 10)).toBe(false);
  });

  it('rejects unsupported number bases', () => {
    expect(isValidGuess('12', 2, 3)).toBe(false);
  });

  it('rejects lengths outside the game limits', () => {
    expect(isValidGuess('0', 1, 10)).toBe(false);
    expect(isValidGuess('0123456', 7, 10)).toBe(false);
  });

  it('rejects a binary secret longer than two digits', () => {
    expect(isValidGuess('010', 3, 2)).toBe(false);
  });
});
