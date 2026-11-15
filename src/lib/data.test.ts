import { describe, expect, test } from 'vitest';
import { DATA_TYPE, FIELD_LENGTH } from './constants';
import { flattenJSON, getDisplayValue, getStoredStringValue, isValidDateValue } from './data';

// An impossible date classified as a date makes toISOString throw after the event row is written.
describe('isValidDateValue', () => {
  test('accepts real ISO datetimes', () => {
    expect(isValidDateValue('2026-05-18T10:30:00Z')).toBe(true);
    expect(isValidDateValue('2026-05-18T10:30:00.123+02:00')).toBe(true);
  });

  test('rejects regex-valid but impossible datetimes', () => {
    expect(isValidDateValue('2026-13-01T00:00:00Z')).toBe(false);
    expect(isValidDateValue('2026-01-32T00:00:00Z')).toBe(false);
    expect(isValidDateValue('2026-01-01T25:00:00Z')).toBe(false);
  });

  test('impossible datetimes are stored as strings instead of throwing', () => {
    const [entry] = flattenJSON({ when: '2026-13-01T00:00:00Z' });

    expect(entry.dataType).toBe(DATA_TYPE.string);
    expect(getStoredStringValue(entry.value, entry.dataType)).toBe('2026-13-01T00:00:00Z');
  });
});

describe('getStoredStringValue', () => {
  test('truncates oversized string values to the storage limit', () => {
    expect(
      getStoredStringValue('x'.repeat(FIELD_LENGTH.stringValue + 25), DATA_TYPE.string),
    ).toHaveLength(FIELD_LENGTH.stringValue);
  });

  test('drops oversized array payloads instead of storing invalid truncated JSON', () => {
    const oversizedArray = JSON.stringify([`x${'y'.repeat(FIELD_LENGTH.stringValue)}`]);

    expect(getStoredStringValue(oversizedArray, DATA_TYPE.array)).toBeNull();
  });
});

describe('getDisplayValue', () => {
  test('uses number_value for numbers when string_value is missing', () => {
    expect(
      getDisplayValue({ dataType: DATA_TYPE.number, stringValue: null, numberValue: 20 }),
    ).toBe('20');
  });

  test('normalizes stored numbers instead of showing padded string_value', () => {
    expect(
      getDisplayValue({
        dataType: DATA_TYPE.number,
        stringValue: '19.9900',
        numberValue: '19.9900',
      }),
    ).toBe('19.99');
  });

  test('falls back to string_value when number_value is missing', () => {
    expect(getDisplayValue({ dataType: DATA_TYPE.number, stringValue: '5.0000' })).toBe('5.0000');
  });

  test('uses date_value when string_value is missing', () => {
    expect(
      getDisplayValue({
        dataType: DATA_TYPE.date,
        stringValue: null,
        dateValue: '2026-10-06T18:36:35.000Z',
      }),
    ).toBe('2026-10-06T18:36:35.000Z');
  });

  test('returns string_value for strings', () => {
    expect(getDisplayValue({ dataType: DATA_TYPE.string, stringValue: 'USD' })).toBe('USD');
  });

  test('returns an empty string when nothing is stored', () => {
    expect(getDisplayValue({ dataType: DATA_TYPE.string, stringValue: null })).toBe('');
  });
});
