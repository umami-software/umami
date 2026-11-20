import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { getItem } from '@/lib/storage';
import { useColumnSelection } from './useColumnSelection';

const ALL = ['a', 'b', 'c', 'd'];
const DEFAULT = ['a', 'b'];

describe('useColumnSelection', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('falls back to defaults when nothing is stored', () => {
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    expect(result.current.visible).toEqual(DEFAULT);
  });

  test('restores a valid stored selection', () => {
    localStorage.setItem('key', JSON.stringify(['b', 'c']));
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    expect(result.current.visible).toEqual(['b', 'c']);
  });

  test('drops unknown ids from storage', () => {
    localStorage.setItem('key', JSON.stringify(['b', 'not-a-column']));
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    expect(result.current.visible).toEqual(['b']);
  });

  test('falls back to defaults for malformed storage', () => {
    localStorage.setItem('key', 'nope');
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    expect(result.current.visible).toEqual(DEFAULT);
  });

  test('toggle adds and removes and persists the selection', () => {
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    act(() => result.current.toggle('c'));
    expect(result.current.visible).toEqual(['a', 'b', 'c']);

    act(() => result.current.toggle('a'));
    expect(result.current.visible).toEqual(['b', 'c']);
    expect(getItem('key')).toEqual(['b', 'c']);
  });

  test('keeps at least one column visible', () => {
    const { result } = renderHook(() => useColumnSelection('key', ALL, ['a']));

    act(() => result.current.toggle('a'));
    expect(result.current.visible).toEqual(['a']);
  });

  test('reset restores the defaults', () => {
    localStorage.setItem('key', JSON.stringify(['d']));
    const { result } = renderHook(() => useColumnSelection('key', ALL, DEFAULT));

    act(() => result.current.reset());
    expect(result.current.visible).toEqual(DEFAULT);
    expect(getItem('key')).toEqual(DEFAULT);
  });
});
