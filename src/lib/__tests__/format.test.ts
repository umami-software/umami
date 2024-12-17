import * as format from '../format';
import { expect } from '@jest/globals';

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
  expect(format.formatLongNumber(1200000)).toBe('1.2m');
  expect(format.formatLongNumber(575000)).toBe('575k');
  expect(format.formatLongNumber(10500)).toBe('10.5k');
  expect(format.formatLongNumber(1200)).toBe('1.20k');
});

test('stringToColor', () => {
  expect(format.stringToColor('hello')).toBe('#d218e9');
  expect(format.stringToColor('goodbye')).toBe('#11e956');
});
