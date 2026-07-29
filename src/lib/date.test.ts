import {
  addDays,
  addMonths,
  endOfDay,
  endOfHour,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  formatDate,
  generateTimeSeries,
  getAllowedUnits,
  getCompareDate,
  getDateRangeValue,
  getDayOfWeekAsDate,
  getMaxSelectableDate,
  getMinimumUnit,
  getMonthDateRangeValue,
  getOffsetDateRange,
  getTimezone,
  isInvalidDate,
  isValidTimezone,
  maxDate,
  minDate,
  normalizeTimezone,
  parseDateRange,
  parseDateValue,
} from './date';

// A fixed instant used across timezone-sensitive tests. All expected date
// values are recomputed with the same date-fns helpers the implementation
// uses, so assertions stay robust regardless of the host timezone.
const NOW = new Date('2026-07-24T12:00:00');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('parseDateValue', () => {
  test.each([
    ['1hour', { num: 1, unit: 'hour' }],
    ['24hour', { num: 24, unit: 'hour' }],
    ['1day', { num: 1, unit: 'day' }],
    ['7day', { num: 7, unit: 'day' }],
    ['1week', { num: 1, unit: 'week' }],
    ['1month', { num: 1, unit: 'month' }],
    ['12month', { num: 12, unit: 'month' }],
    ['1year', { num: 1, unit: 'year' }],
    ['0day', { num: 0, unit: 'day' }],
  ])('parses %s', (input, expected) => {
    expect(parseDateValue(input)).toEqual(expected);
  });

  test('returns null for unsupported units', () => {
    expect(parseDateValue('1minute')).toBeNull();
    expect(parseDateValue('1decade')).toBeNull();
    expect(parseDateValue('range:1:2')).toBeNull();
    expect(parseDateValue('')).toBeNull();
    expect(parseDateValue('day')).toBeNull();
  });

  test('returns null when value lacks a matching pattern (has match method)', () => {
    // Non-string values that still expose (an absent) `.match` are guarded by
    // optional chaining and yield null.
    expect(parseDateValue(123 as any)).toBeNull();
    expect(parseDateValue({} as any)).toBeNull();
  });
});

describe('parseDateRange', () => {
  test('returns null for non-string input', () => {
    expect(parseDateRange(null as any)).toBeNull();
    expect(parseDateRange(123 as any)).toBeNull();
    expect(parseDateRange(undefined as any)).toBeNull();
  });

  test('parses hour ranges', () => {
    const result = parseDateRange('24hour');
    expect(result).toMatchObject({
      unit: 'hour',
      num: 24,
      offset: 0,
      value: '24hour',
    });
    expect(result.startDate).toEqual(subHours(startOfHour(NOW), 24));
    expect(result.endDate).toEqual(endOfHour(NOW));
  });

  test('parses day ranges', () => {
    const result = parseDateRange('7day');
    expect(result).toMatchObject({
      unit: 'day',
      num: 7,
      offset: 0,
      value: '7day',
    });
    expect(result.startDate).toEqual(subDays(startOfDay(NOW), 7));
    expect(result.endDate).toEqual(endOfDay(NOW));
  });

  test('parses week ranges', () => {
    const result = parseDateRange('4week');
    expect(result).toMatchObject({
      unit: 'day',
      num: 4,
      offset: 0,
      value: '4week',
    });
    expect(result.startDate).toEqual(subWeeks(startOfWeek(NOW), 4));
    expect(result.endDate).toEqual(endOfWeek(NOW));
  });

  test('parses month ranges', () => {
    const result = parseDateRange('6month');
    expect(result).toMatchObject({
      unit: 'month',
      num: 6,
      offset: 0,
      value: '6month',
    });
    expect(result.startDate).toEqual(subMonths(startOfMonth(NOW), 6));
    expect(result.endDate).toEqual(endOfMonth(NOW));
  });

  test('parses year ranges', () => {
    const result = parseDateRange('1year');
    expect(result).toMatchObject({
      unit: 'month',
      num: 1,
      offset: 0,
      value: '1year',
    });
    expect(result.startDate).toEqual(subYears(startOfYear(NOW), 1));
    expect(result.endDate).toEqual(endOfYear(NOW));
  });

  test('handles zero-num keyword variants ("this period")', () => {
    // 0day => the current day only, unit collapses to hour
    const day = parseDateRange('0day');
    expect(day).toMatchObject({ unit: 'hour', num: 1, offset: 0 });
    expect(day.startDate).toEqual(startOfDay(NOW));
    expect(day.endDate).toEqual(endOfDay(NOW));

    // 0month => the current month only, unit collapses to day
    const month = parseDateRange('0month');
    expect(month).toMatchObject({ unit: 'day', num: 1 });
    expect(month.startDate).toEqual(startOfMonth(NOW));

    // 0hour => still one hour, unit stays hour
    const hour = parseDateRange('0hour');
    expect(hour).toMatchObject({ unit: 'hour', num: 1 });
    expect(hour.startDate).toEqual(startOfHour(NOW));
  });

  test('honors the unitValue override', () => {
    const result = parseDateRange('7day', 'week');
    expect(result.unit).toBe('week');
    expect(result.num).toBe(7);
  });

  test('parses explicit range values', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-11T00:00:00Z'); // 10 days -> day unit
    const value = `range:${start.getTime()}:${end.getTime()}`;

    const result = parseDateRange(value);
    expect(result.startDate).toEqual(start);
    expect(result.endDate).toEqual(end);
    expect(result.value).toBe(value);
    expect(result.unit).toBe('day');
  });

  test('range unit reflects minimum unit of the span', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-01T00:30:00Z'); // 30 minutes
    const value = getDateRangeValue(start, end);
    expect(parseDateRange(value).unit).toBe('minute');
  });

  test('applies timezone conversion without throwing and preserves metadata', () => {
    const result = parseDateRange('1day', undefined, 'en-US', 'America/New_York');
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result).toMatchObject({ unit: 'day', num: 1, value: '1day' });
  });
});

describe('getOffsetDateRange', () => {
  test('returns the same range when offset is 0', () => {
    const range = parseDateRange('7day');
    expect(getOffsetDateRange(range, 0)).toBe(range);
  });

  test('shifts day ranges backward', () => {
    const range = parseDateRange('7day');
    const shifted = getOffsetDateRange(range, -1);
    expect(shifted.offset).toBe(-1);
    // change = num * offset = 7 * -1
    expect(shifted.startDate).toEqual(addDays(range.startDate, -7));
    expect(shifted.endDate).toEqual(addDays(range.endDate, -7));
  });

  test('shifts month ranges and handles month boundaries', () => {
    const range = parseDateRange('1month');
    const shifted = getOffsetDateRange(range, -1);
    expect(shifted.offset).toBe(-1);
    expect(shifted.startDate).toEqual(addMonths(range.startDate, -1));
    expect(shifted.endDate).toEqual(addMonths(range.endDate, -1));
  });

  test('shifts year ranges (year rollover)', () => {
    const range = parseDateRange('1year');
    const shifted = getOffsetDateRange(range, 1);
    expect(shifted.startDate.getFullYear()).toBe(range.startDate.getFullYear() + 1);
  });

  test('falls back to unit add function for explicit ranges', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-11T00:00:00Z');
    const range = parseDateRange(getDateRangeValue(start, end));
    // originalUnit from parseDateValue('range:...') is undefined -> default branch
    const shifted = getOffsetDateRange(range, 1);
    expect(shifted.offset).toBe(1);
    expect(shifted.startDate).toBeInstanceOf(Date);
    expect(shifted.endDate).toBeInstanceOf(Date);
  });
});

describe('getMinimumUnit', () => {
  const base = new Date('2026-01-01T00:00:00Z');

  test('returns minute for spans up to 60 minutes', () => {
    expect(getMinimumUnit(base, new Date('2026-01-01T00:59:00Z'))).toBe('minute');
    expect(getMinimumUnit(base, new Date('2026-01-01T01:00:00Z'))).toBe('minute');
  });

  test('returns hour for spans up to 30 days (non date-range)', () => {
    expect(getMinimumUnit(base, new Date('2026-01-15T00:00:00Z'))).toBe('hour');
  });

  test('date-range mode caps hour at 48 hours', () => {
    const within = new Date('2026-01-02T23:00:00Z'); // ~47h
    const beyond = new Date('2026-01-05T00:00:00Z'); // >48h
    expect(getMinimumUnit(base, within, true)).toBe('hour');
    expect(getMinimumUnit(base, beyond, true)).toBe('day');
  });

  test('returns day for spans up to 7 calendar months', () => {
    expect(getMinimumUnit(base, new Date('2026-06-01T00:00:00Z'))).toBe('day');
  });

  test('returns month for spans up to 24 calendar months', () => {
    expect(getMinimumUnit(base, new Date('2027-06-01T00:00:00Z'))).toBe('month');
  });

  test('returns year for spans beyond 24 calendar months', () => {
    expect(getMinimumUnit(base, new Date('2029-01-01T00:00:00Z'))).toBe('year');
  });
});

describe('getAllowedUnits', () => {
  const base = new Date('2026-01-01T00:00:00Z');

  test('includes all units for minute-level spans', () => {
    expect(getAllowedUnits(base, new Date('2026-01-01T00:30:00Z'))).toEqual([
      'minute',
      'hour',
      'day',
      'month',
      'year',
    ]);
  });

  test('drops finer units for day-level spans', () => {
    // ~4 months -> minimum unit day
    expect(getAllowedUnits(base, new Date('2026-05-01T00:00:00Z'))).toEqual([
      'day',
      'month',
      'year',
    ]);
  });

  test('maps year minimum down to month as the finest allowed unit', () => {
    expect(getAllowedUnits(base, new Date('2030-01-01T00:00:00Z'))).toEqual(['month', 'year']);
  });
});

describe('getCompareDate', () => {
  const startDate = new Date('2026-07-01T00:00:00Z');
  const endDate = new Date('2026-07-08T00:00:00Z');

  test('year over year shifts both bounds back one year', () => {
    expect(getCompareDate('yoy', startDate, endDate)).toEqual({
      compare: 'yoy',
      startDate: subYears(startDate, 1),
      endDate: subYears(endDate, 1),
    });
  });

  test('previous period shifts back by the span length', () => {
    const result = getCompareDate('prev', startDate, endDate);
    expect(result.compare).toBe('prev');
    // 7 days = 10080 minutes
    expect(result.startDate).toEqual(subMinutes(startDate, 10080));
    expect(result.endDate).toEqual(subMinutes(endDate, 10080));
    expect(result.endDate).toEqual(startDate);
  });

  test('returns empty object for unknown compare modes', () => {
    expect(getCompareDate('unknown', startDate, endDate)).toEqual({});
  });
});

describe('maxDate / minDate', () => {
  const a = new Date('2026-01-01T00:00:00Z');
  const b = new Date('2026-06-01T00:00:00Z');
  const c = new Date('2026-12-01T00:00:00Z');

  test('maxDate returns the latest valid date, ignoring non-dates', () => {
    expect(maxDate(a, b, c)).toEqual(c);
    expect(maxDate(a, null as any, c, undefined as any)).toEqual(c);
  });

  test('minDate returns the earliest valid date, ignoring non-dates', () => {
    expect(minDate(a, b, c)).toEqual(a);
    expect(minDate(null, a, 'nope', c)).toEqual(a);
  });
});

describe('getDayOfWeekAsDate', () => {
  test('returns a future date, never today', () => {
    const result = getDayOfWeekAsDate(0);
    // Same weekday as start of current week would collide with today -> pushed +7
    expect(result.getTime()).toBeGreaterThan(NOW.getTime());
  });

  test('later weekdays fall within the current week window', () => {
    const start = startOfWeek(NOW);
    const result = getDayOfWeekAsDate(6);
    expect(result).toEqual(addDays(start, 6));
  });
});

describe('formatDate', () => {
  test('formats a Date with a custom pattern', () => {
    const date = new Date('2026-07-24T00:00:00');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-07-24');
  });

  test('accepts string input', () => {
    expect(formatDate('2026-07-24T00:00:00', 'yyyy-MM-dd')).toBe('2026-07-24');
  });

  test('accepts numeric timestamp input', () => {
    const date = new Date('2026-07-24T00:00:00');
    expect(formatDate(date.getTime(), 'yyyy')).toBe('2026');
  });
});

describe('generateTimeSeries', () => {
  test('fills gaps between min and max with null values (day unit)', () => {
    const min = new Date('2026-07-01T00:00:00');
    const max = new Date('2026-07-05T00:00:00');
    const data = [
      { x: '2026-07-02T00:00:00', y: 10 },
      { x: '2026-07-04T00:00:00', y: 20 },
    ];

    const series = generateTimeSeries(data, min, max, 'day', 'en-US');

    // Inclusive of both ends: Jul 1..5 => 5 buckets
    expect(series).toHaveLength(5);
    expect(series.map(s => s.x)).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
    ]);
    expect(series[0].y).toBeNull();
    expect(series[1].y).toBe(10);
    expect(series[3].y).toBe(20);
    expect(series[4].y).toBeNull();
  });

  test('single bucket when min and max share a period', () => {
    const min = new Date('2026-07-01T03:00:00');
    const max = new Date('2026-07-01T21:00:00');
    const series = generateTimeSeries([], min, max, 'day', 'en-US');
    expect(series).toHaveLength(1);
    expect(series[0].y).toBeNull();
  });
});

describe('getDateRangeValue / getMonthDateRangeValue', () => {
  test('builds a range token from two dates', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-02-01T00:00:00Z');
    expect(getDateRangeValue(start, end)).toBe(`range:${start.getTime()}:${end.getTime()}`);
  });

  test('builds a month range token spanning the whole month', () => {
    const date = new Date('2026-07-15T12:00:00');
    const value = getMonthDateRangeValue(date);
    const [, startTime, endTime] = value.split(':');
    expect(new Date(+startTime)).toEqual(startOfMonth(date));
    expect(new Date(+endTime)).toEqual(endOfMonth(date));
  });
});

describe('getMaxSelectableDate', () => {
  test('returns the later of end-of-year or six months out', () => {
    // For July, +6 months (late Jan next year) is later than end of the year.
    expect(getMaxSelectableDate(NOW)).toEqual(addMonths(NOW, 6));
  });

  test('picks end of year when it is later than +6 months', () => {
    // Early January: end of this year is far beyond +6 months.
    const january = new Date('2026-01-02T00:00:00');
    expect(getMaxSelectableDate(january)).toEqual(endOfYear(january));
  });
});

describe('timezone helpers', () => {
  test('normalizeTimezone maps deprecated aliases', () => {
    expect(normalizeTimezone('Asia/Calcutta')).toBe('Asia/Kolkata');
    expect(normalizeTimezone('America/New_York')).toBe('America/New_York');
  });

  test('isValidTimezone accepts real and aliased zones', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Asia/Calcutta')).toBe(true);
    expect(isValidTimezone('Not/AZone')).toBe(false);
  });

  test('getTimezone returns a non-empty string', () => {
    expect(typeof getTimezone()).toBe('string');
    expect(getTimezone().length).toBeGreaterThan(0);
  });
});

describe('isInvalidDate', () => {
  test('detects invalid Date instances', () => {
    expect(isInvalidDate(new Date('not a date'))).toBe(true);
  });

  test('valid dates and non-dates are not flagged', () => {
    expect(isInvalidDate(new Date('2026-07-24'))).toBe(false);
    expect(isInvalidDate('2026-07-24')).toBe(false);
    expect(isInvalidDate(null)).toBe(false);
    expect(isInvalidDate(undefined)).toBe(false);
  });
});
