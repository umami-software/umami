import { DATA_TYPE } from '../constants';
import {
  flattenJSON,
  createKeyValue,
  isValidDateValue,
  getDataType,
  getStringValue,
  objectToArray,
  type KeyValueData,
} from '../data';

describe('isValidDateValue', () => {
  test.each([
    ['2024-01-15T10:30:00Z', true],
    ['2024-01-15T10:30:00.123Z', true],
    ['2024-01-15T10:30:00+02:00', true],
    ['not-a-date', false],
    ['2024/01/15', false],
    ['', false],
  ])('validates datetime strings correctly (%s → %s)', (input, expected) => {
    expect(isValidDateValue(input)).toBe(expected);
  });

  test('returns false for non-string values', () => {
    expect(isValidDateValue(123 as any)).toBe(false);
    expect(isValidDateValue(null as any)).toBe(false);
    expect(isValidDateValue(undefined as any)).toBe(false);
  });
});

describe('getDataType', () => {
  test.each([
    ['string', 'string'],
    [123, 'number'],
    [true, 'boolean'],
    [null, 'object'],
    [[], 'object'],
    [{}, 'object'],
    ['2024-01-15T10:30:00Z', 'date'],
  ])('detects type correctly (%s → %s)', (input, expected) => {
    expect(getDataType(input)).toBe(expected);
  });
});

describe('createKeyValue', () => {
  test('handles string values', () => {
    const result = createKeyValue('name', 'test');
    expect(result).toEqual({
      key: 'name',
      value: 'test',
      dataType: DATA_TYPE.string,
    });
  });

  test('handles number values', () => {
    const result = createKeyValue('count', 42);
    expect(result).toEqual({
      key: 'count',
      value: 42,
      dataType: DATA_TYPE.number,
    });
  });

  test('handles boolean values and converts to string', () => {
    expect(createKeyValue('active', true)).toEqual({
      key: 'active',
      value: 'true',
      dataType: DATA_TYPE.boolean,
    });
    expect(createKeyValue('active', false)).toEqual({
      key: 'active',
      value: 'false',
      dataType: DATA_TYPE.boolean,
    });
  });

  test('handles date strings', () => {
    const dateStr = '2024-01-15T10:30:00Z';
    const result = createKeyValue('timestamp', dateStr);
    expect(result).toEqual({
      key: 'timestamp',
      value: dateStr,
      dataType: DATA_TYPE.date,
    });
  });

  test('handles arrays and converts to JSON string', () => {
    const arr = [1, 2, 3];
    const result = createKeyValue('items', arr);
    expect(result).toEqual({
      key: 'items',
      value: '[1,2,3]',
      dataType: DATA_TYPE.array,
    });
  });

  test('handles null values', () => {
    const result = createKeyValue('nullable', null);
    expect(result.dataType).toBe(DATA_TYPE.array);
    expect(result.value).toBe('null');
  });
});

describe('getStringValue', () => {
  test('formats number values with 4 decimal places', () => {
    expect(getStringValue('42', DATA_TYPE.number)).toBe('42.0000');
    expect(getStringValue('3.14159', DATA_TYPE.number)).toBe('3.1416');
  });

  test('converts date values to ISO string', () => {
    const result = getStringValue('2024-01-15T10:30:00', DATA_TYPE.date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('returns string values as-is for other types', () => {
    expect(getStringValue('test', DATA_TYPE.string)).toBe('test');
    expect(getStringValue('true', DATA_TYPE.boolean)).toBe('true');
  });
});

describe('objectToArray', () => {
  test('converts object values to array', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = objectToArray(obj);
    expect(result).toEqual([1, 2, 3]);
  });

  test('returns empty array for empty object', () => {
    expect(objectToArray({})).toEqual([]);
  });
});

describe('flattenJSON', () => {
  test('flattens simple object', () => {
    const input = {
      name: 'test',
      count: 42,
    };

    const result = flattenJSON(input);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(expect.objectContaining({ key: 'name', value: 'test' }));
    expect(result).toContainEqual(expect.objectContaining({ key: 'count', value: 42 }));
  });

  test('flattens nested object with dot notation', () => {
    const input = {
      user: {
        name: 'John',
        age: 30,
      },
    };

    const result = flattenJSON(input);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(expect.objectContaining({ key: 'user.name', value: 'John' }));
    expect(result).toContainEqual(expect.objectContaining({ key: 'user.age', value: 30 }));
  });

  test('flattens deeply nested object', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
          },
        },
      },
    };

    const result = flattenJSON(input);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('level1.level2.level3.value');
    expect(result[0].value).toBe('deep');
  });

  test('treats arrays as leaf values (converts to JSON string)', () => {
    const input = {
      tags: ['a', 'b', 'c'],
    };

    const result = flattenJSON(input);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('tags');
    expect(result[0].value).toBe('["a","b","c"]');
    expect(result[0].dataType).toBe(DATA_TYPE.array);
  });

  test('treats date strings as leaf values', () => {
    const input = {
      createdAt: '2024-01-15T10:30:00Z',
    };

    const result = flattenJSON(input);

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('createdAt');
    expect(result[0].dataType).toBe(DATA_TYPE.date);
  });

  test('handles mixed nested and flat structure', () => {
    const input = {
      id: '123',
      metadata: {
        timestamp: '2024-01-15T10:30:00Z',
        source: 'web',
        details: {
          referrer: 'google',
        },
      },
    };

    const result = flattenJSON(input);
    const keys = result.map(r => r.key);

    expect(result).toHaveLength(4);
    expect(keys).toContain('id');
    expect(keys).toContain('metadata.timestamp');
    expect(keys).toContain('metadata.source');
    expect(keys).toContain('metadata.details.referrer');
  });

  test('returns empty array for empty object', () => {
    expect(flattenJSON({})).toEqual([]);
  });

  test('converts boolean values to strings', () => {
    const input = {
      isActive: true,
      isAdmin: false,
    };

    const result = flattenJSON(input);

    expect(result).toContainEqual(
      expect.objectContaining({ key: 'isActive', value: 'true', dataType: DATA_TYPE.boolean }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({ key: 'isAdmin', value: 'false', dataType: DATA_TYPE.boolean }),
    );
  });
});
