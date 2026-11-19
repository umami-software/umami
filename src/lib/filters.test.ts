import { describe, expect, test } from 'vitest';
import { paramFilter, percentFilter } from './filters';

describe('percentFilter', () => {
  test('computes each row percentage of the total', () => {
    const result = percentFilter([
      { x: 'a', y: 25 },
      { x: 'b', y: 75 },
    ]);

    expect(result).toEqual([
      { x: 'a', y: 25, z: 25 },
      { x: 'b', y: 75, z: 75 },
    ]);
  });

  test('preserves extra props', () => {
    const result = percentFilter([{ x: 'a', y: 10, label: 'foo' }]);
    expect(result[0]).toMatchObject({ x: 'a', y: 10, z: 100, label: 'foo' });
  });

  test('uses zero percentage when total is zero', () => {
    const result = percentFilter([
      { x: 'a', y: 0 },
      { x: 'b', y: 0 },
    ]);

    expect(result).toEqual([
      { x: 'a', y: 0, z: 0 },
      { x: 'b', y: 0, z: 0 },
    ]);
  });

  test('returns an empty array for non-array input', () => {
    expect(percentFilter(undefined as any)).toEqual([]);
    expect(percentFilter(null as any)).toEqual([]);
  });
});

describe('paramFilter', () => {
  test('splits query string keys into rows', () => {
    const result = paramFilter([{ x: 'a=1&b=2', y: 5 }]);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 'a=1', p: 'a', v: '1', y: 5 },
        { x: 'b=2', p: 'b', v: '2', y: 5 },
      ]),
    );
    expect(result).toHaveLength(2);
  });

  test('aggregates counts across matching key/value pairs', () => {
    const result = paramFilter([
      { x: 'a=1', y: 5 },
      { x: 'a=1', y: 3 },
      { x: 'a=2', y: 1 },
    ]);

    expect(result).toEqual(
      expect.arrayContaining([
        { x: 'a=1', p: 'a', v: '1', y: 8 },
        { x: 'a=2', p: 'a', v: '2', y: 1 },
      ]),
    );
    expect(result).toHaveLength(2);
  });

  test('returns an empty array when there are no params', () => {
    expect(paramFilter([{ x: '', y: 1 }])).toEqual([]);
  });
});
