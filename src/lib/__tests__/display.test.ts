jest.mock('../format', () => ({
  formatNumber: (n: number | string) => String(n),
}));

import { formatCompactLabel } from '../display';

test('formatCompactLabel combines a truncated id with a formatted value', () => {
  expect(formatCompactLabel('abc-1234567890-xyz', 1500, 10)).toBe('abc...xyz (1500)');
});

test('formatCompactLabel leaves short ids untouched', () => {
  expect(formatCompactLabel('short', 42, 16)).toBe('short (42)');
});
