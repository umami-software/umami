import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { chunkArray, ensureArray, hook, shuffleArray, sleep } from './utils';

describe('hook', () => {
  test('calls callback then original and returns original result', () => {
    const calls: string[] = [];
    const obj = {
      value: 5,
      method(this: any, n: number) {
        calls.push('orig');
        return this.value + n;
      },
    };

    const callback = vi.fn(function (this: any, _n: number) {
      calls.push('cb');
    });

    const wrapped = hook(obj, 'method', callback);
    const result = wrapped(10);

    expect(result).toBe(15);
    expect(callback).toHaveBeenCalledWith(10);
    expect(calls).toEqual(['cb', 'orig']);
  });
});

describe('chunkArray', () => {
  test('splits an array into chunks of the given size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('returns a single chunk when size exceeds length', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  test('returns an empty array for an empty input', () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});

describe('ensureArray', () => {
  test('returns empty array for undefined', () => {
    expect(ensureArray(undefined)).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(ensureArray(null)).toEqual([]);
  });

  test('returns the same array when given an array', () => {
    const arr = [1, 2, 3];
    expect(ensureArray(arr)).toBe(arr);
  });

  test('wraps a non-array value in an array', () => {
    expect(ensureArray('a')).toEqual(['a']);
    expect(ensureArray(0)).toEqual([0]);
  });
});

describe('shuffleArray', () => {
  test('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  test('returns an array with the same length and members', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleArray(arr);
    expect(result).toHaveLength(arr.length);
    expect([...result].sort()).toEqual([...arr].sort());
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('resolves after the given delay', async () => {
    const resolved = vi.fn();
    const promise = sleep(1000).then(resolved);

    expect(resolved).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(resolved).toHaveBeenCalled();
  });
});
