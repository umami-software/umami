import { describe, expect, test } from 'vitest';
import { DATA_TYPE, FIELD_LENGTH } from './constants';
import { getStoredStringValue } from './data';

describe('getStoredStringValue', () => {
  test('truncates oversized string values to the storage limit', () => {
    expect(getStoredStringValue('x'.repeat(FIELD_LENGTH.stringValue + 25), DATA_TYPE.string)).toHaveLength(
      FIELD_LENGTH.stringValue,
    );
  });

  test('drops oversized array payloads instead of storing invalid truncated JSON', () => {
    const oversizedArray = JSON.stringify([`x${'y'.repeat(FIELD_LENGTH.stringValue)}`]);

    expect(getStoredStringValue(oversizedArray, DATA_TYPE.array)).toBeNull();
  });
});
