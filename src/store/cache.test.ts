import { beforeEach, describe, expect, test } from 'vitest';
import { setValue, useCache } from './cache';

beforeEach(() => {
  useCache.setState({}, true);
});

describe('setValue', () => {
  test('sets a value under the given key', () => {
    setValue('websites', 5);
    expect((useCache.getState() as any).websites).toBe(5);
  });

  test('merges additional keys without dropping existing ones', () => {
    setValue('a', 1);
    setValue('b', 2);

    const state = useCache.getState() as any;
    expect(state.a).toBe(1);
    expect(state.b).toBe(2);
  });

  test('overwrites an existing key', () => {
    setValue('a', 1);
    setValue('a', 2);
    expect((useCache.getState() as any).a).toBe(2);
  });

  test('supports object values', () => {
    setValue('report', { id: 'r1' });
    expect((useCache.getState() as any).report).toEqual({ id: 'r1' });
  });
});
