import { matchesConfiguredPath } from '../match-configured-path';

test('matches the exact configured path', () => {
  expect(matchesConfiguredPath('/d.js', 'd.js')).toBe(true);
});

test('does not match unrelated asset paths that only share the suffix', () => {
  expect(matchesConfiguredPath('/_next/static/chunks/app/dashboard.js', 'd.js')).toBe(false);
});

test('matches paths under the configured base path', () => {
  expect(matchesConfiguredPath('/umami/d.js', 'd.js', '/umami')).toBe(true);
});

test('normalizes leading slashes in configured paths', () => {
  expect(matchesConfiguredPath('/script.js', '/script.js')).toBe(true);
});
