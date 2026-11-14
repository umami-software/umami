import { expect, test } from 'vitest';
import * as format from './format';

test('parseTime', () => {
  expect(format.parseTime(86400 + 3600 + 60 + 1)).toEqual({
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
    ms: 0,
  });
});

test('formatTime', () => {
  expect(format.formatTime(3600 + 60 + 1)).toBe('1:01:01');
});

test('formatShortTime', () => {
  expect(format.formatShortTime(3600 + 60 + 1)).toBe('1m1s');

  expect(format.formatShortTime(3600 + 60 + 1, ['h', 'm', 's'])).toBe('1h1m1s');
});

test('formatNumber', () => {
  expect(format.formatNumber('10.2')).toBe('10');
  expect(format.formatNumber('10.5')).toBe('11');
});

test('formatLongNumber', () => {
  expect(format.formatLongNumber(1000000000)).toBe('1.0b');
  expect(format.formatLongNumber(2500000000)).toBe('2.5b');
  expect(format.formatLongNumber(1200000)).toBe('1.2m');
  expect(format.formatLongNumber(575000)).toBe('575k');
  expect(format.formatLongNumber(10500)).toBe('10.5k');
  expect(format.formatLongNumber(1200)).toBe('1.20k');
});

test('formatLongNumber moves values that round up to the next format', () => {
  expect(format.formatLongNumber(999999999)).toBe('1.0b');
  expect(format.formatLongNumber(999999)).toBe('1.0m');
  expect(format.formatLongNumber(99999)).toBe('100k');
  expect(format.formatLongNumber(9999)).toBe('10.0k');
  expect(format.formatLongNumber(999.6)).toBe('1.00k');

  expect(format.formatLongNumber(999949999)).toBe('999.9m');
  expect(format.formatLongNumber(999499)).toBe('999k');
  expect(format.formatLongNumber(99949)).toBe('99.9k');
  expect(format.formatLongNumber(9994)).toBe('9.99k');
  expect(format.formatLongNumber(999)).toBe('999');
});

test('formatLongCurrency', () => {
  expect(format.formatLongCurrency(1000000000, 'USD')).toBe('$1.00b');
  expect(format.formatLongCurrency(2500000000, 'USD')).toBe('$2.50b');
  expect(format.formatLongCurrency(1200000, 'USD')).toBe('$1.20m');
  expect(format.formatLongCurrency(575000, 'USD')).toBe('$575.00k');
  expect(format.formatLongCurrency(1200, 'USD')).toBe('$1.20k');
  expect(format.formatLongCurrency(42.5, 'USD')).toBe('$42.50');
});

test('formatLongCurrency moves values that round up to the next format', () => {
  // USD uses 2 fraction digits, so values that round to 1000 of a unit
  // must move to the next unit instead of showing $1,000.00k / $1,000.00m.
  expect(format.formatLongCurrency(999999999, 'USD')).toBe('$1.00b');
  expect(format.formatLongCurrency(999995000, 'USD')).toBe('$1.00b');
  expect(format.formatLongCurrency(999999, 'USD')).toBe('$1.00m');
  expect(format.formatLongCurrency(999995, 'USD')).toBe('$1.00m');
  expect(format.formatLongCurrency(999.995, 'USD')).toBe('$1.00k');

  expect(format.formatLongCurrency(999994999, 'USD')).toBe('$999.99m');
  expect(format.formatLongCurrency(999994, 'USD')).toBe('$999.99k');
  expect(format.formatLongCurrency(999.994, 'USD')).toBe('$999.99');
});

test('formatLongCurrency thresholds follow JPY 0 fraction digits', () => {
  // JPY has no fraction digits, so 999.5 already rounds to ¥1,000.
  expect(format.formatLongCurrency(999900, 'JPY')).toBe('¥1m');
  expect(format.formatLongCurrency(999500, 'JPY')).toBe('¥1m');
  expect(format.formatLongCurrency(999499, 'JPY')).toBe('¥999k');
  expect(format.formatLongCurrency(999.5, 'JPY')).toBe('¥1k');
  expect(format.formatLongCurrency(999.4, 'JPY')).toBe('¥999');
});

test('formatLongCurrency thresholds follow KWD 3 fraction digits', () => {
  // KWD uses 3 fraction digits, so 999.996 must stay in the base unit.
  expect(format.formatLongCurrency(999.996, 'KWD')).toBe('KWD\u00A0999.996');
  expect(format.formatLongCurrency(999.9995, 'KWD')).toBe('KWD\u00A01.000k');
  expect(format.formatLongCurrency(999.9994, 'KWD')).toBe('KWD\u00A0999.999');
});

test('stringToColor', () => {
  expect(format.stringToColor('hello')).toBe('#d218e9');
  expect(format.stringToColor('goodbye')).toBe('#11e956');
});

test('truncateString', () => {
  expect(format.truncateString('hello', 3)).toBe('hel');
  expect(format.truncateString(undefined, 3)).toBeUndefined();
});

test('decodePunycodeDomain', () => {
  expect(format.decodePunycodeDomain('xn--bcher-kva.example')).toBe('bücher.example');
  expect(format.decodePunycodeDomain('example.com')).toBe('example.com');
  expect(format.decodePunycodeDomain(undefined)).toBeUndefined();
});
