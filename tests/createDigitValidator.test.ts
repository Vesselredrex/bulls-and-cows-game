import { describe, expect, it } from 'vitest';
import { createDigitValidator } from '../src/game/createDigitValidator';

describe('createDigitValidator', () => {
  it('accepts 0 and 1 in binary', () => {
    const validate = createDigitValidator(2);

    expect(validate('0')).toBe(true);
    expect(validate('1')).toBe(true);
  });

  it('rejects 2 in binary', () => {
    expect(createDigitValidator(2)('2')).toBe(false);
  });

  it('accepts 7 but rejects 8 in octal', () => {
    const validate = createDigitValidator(8);

    expect(validate('7')).toBe(true);
    expect(validate('8')).toBe(false);
  });

  it('accepts 9 but rejects A in decimal', () => {
    const validate = createDigitValidator(10);

    expect(validate('9')).toBe(true);
    expect(validate('A')).toBe(false);
  });

  it('accepts hexadecimal letters regardless of case', () => {
    const validate = createDigitValidator(16);

    expect(validate('a')).toBe(true);
    expect(validate('F')).toBe(true);
  });

  it('rejects characters outside hexadecimal digits', () => {
    expect(createDigitValidator(16)('g')).toBe(false);
  });

  it('rejects empty strings and multiple characters', () => {
    const validate = createDigitValidator(10);

    expect(validate('')).toBe(false);
    expect(validate('12')).toBe(false);
  });

  it('rejects unsupported number bases', () => {
    expect(() => createDigitValidator(3)).toThrow(RangeError);
  });
});
