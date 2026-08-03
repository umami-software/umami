import { describe, expect, test } from 'vitest';
import { getRandomChars, random } from './generate';

describe('random', () => {
  test('returns a value within the inclusive range', () => {
    for (let i = 0; i < 1000; i++) {
      const n = random(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  test('returns the single value when min equals max', () => {
    expect(random(5, 5)).toBe(5);
  });
});

describe('getRandomChars', () => {
  test('returns a string of the requested length', () => {
    expect(getRandomChars(16)).toHaveLength(16);
    expect(getRandomChars(0)).toBe('');
  });

  test('only uses characters from the default alphabet', () => {
    expect(getRandomChars(200)).toMatch(/^[0-9a-zA-Z]+$/);
  });

  test('respects a custom character set', () => {
    expect(getRandomChars(50, 'ab')).toMatch(/^[ab]+$/);
  });

  test('produces reasonably unique values', () => {
    const values = new Set(Array.from({ length: 100 }, () => getRandomChars(16)));
    expect(values.size).toBe(100);
  });
});
