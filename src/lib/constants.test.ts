import { describe, expect, test } from 'vitest';
import { DOMAIN_REGEX } from './constants';

describe('DOMAIN_REGEX', () => {
  test.each([
    'example.com',
    'www.example.co.uk',
    'my-site_1.example.org',
    'xn--bcher-kva.example',
    'example.xn--p1ai',
    'localhost',
    'localhost:3000',
  ])('accepts %s', domain => {
    expect(DOMAIN_REGEX.test(domain)).toBe(true);
  });

  test.each(['example', 'a.b', 'a..com', 'example.com/', 'localhost:0', 'Example.com'])(
    'rejects %s',
    domain => {
      expect(DOMAIN_REGEX.test(domain)).toBe(false);
    },
  );

  test('rejects crafted input without catastrophic backtracking', () => {
    // Took ~50s with the previous pattern: hyphens matched both `[a-z0-9-_]+` and `(-[a-z0-9-_]+)*`.
    const input = `${`a${'-'.repeat(16)}.`.repeat(3)}!`;
    const start = performance.now();
    expect(DOMAIN_REGEX.test(input)).toBe(false);
    expect(performance.now() - start).toBeLessThan(100);
  });
});
