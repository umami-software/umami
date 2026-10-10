import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const labels = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string) => prop,
});

const nav: { pathname: string; query: Record<string, any> } = {
  pathname: '/websites/1',
  query: {},
};

let shareValue: any = null;

const fields = [
  { name: 'path', label: 'Path' },
  { name: 'country', label: 'Country' },
];

vi.mock('./useMessages', () => ({
  useMessages: () => ({ t: (value: string) => value, labels }),
}));

vi.mock('./useNavigation', () => ({
  useNavigation: () => nav,
}));

vi.mock('./useFields', () => ({
  useFields: () => ({ fields }),
}));

vi.mock('./useOperatorLabels', () => ({
  useOperatorLabels: () => new Proxy({} as Record<string, string>, { get: (_t, p: string) => p }),
}));

vi.mock('./context/useShare', () => ({
  useShare: () => shareValue,
}));

vi.mock('@/lib/params', () => ({
  parseSessionPropertyFilters: vi.fn(() => ['session-filter']),
  parseUniversalEventPropertyFilters: vi.fn(() => ['event-filter']),
}));

import { parseSessionPropertyFilters, parseUniversalEventPropertyFilters } from '@/lib/params';
import { useFilters } from './useFilters';

function setup() {
  return renderHook(() => useFilters()).result.current;
}

describe('useFilters', () => {
  beforeEach(() => {
    nav.pathname = '/websites/1';
    nav.query = {};
    shareValue = null;
    vi.clearAllMocks();
  });

  describe('filters', () => {
    test('builds a filter for a filterable column with a default operator', () => {
      nav.query = { country: 'US' };
      const { filters } = setup();

      expect(filters).toEqual([
        { name: 'country', type: 'country', operator: 'eq', value: 'US', label: 'Country' },
      ]);
    });

    test('parses an embedded operator prefix', () => {
      nav.query = { path: 'c.blog' };
      const { filters } = setup();

      expect(filters).toEqual([
        { name: 'path', type: 'path', operator: 'c', value: 'blog', label: 'Path' },
      ]);
    });

    test('strips a trailing index to resolve the base column name', () => {
      nav.query = { path1: 'eq.home' };
      const { filters } = setup();

      expect(filters).toEqual([
        { name: 'path1', type: 'path', operator: 'eq', value: 'home', label: 'Path' },
      ]);
    });

    test('ignores query keys that are not filter columns', () => {
      nav.query = { page: '2', search: 'foo', path: 'x' };
      const { filters } = setup();

      expect(filters.map(f => f.name)).toEqual(['path']);
    });

    test('decodes URI-encoded values', () => {
      nav.query = { path: 'c.a%20b' };
      const { filters } = setup();

      expect(filters[0].value).toBe('a b');
    });

    test('returns no filters when sharing disallows filtering', () => {
      shareValue = { parameters: { allowFilter: false } };
      nav.query = { path: 'c.blog' };
      const { filters } = setup();

      expect(filters).toEqual([]);
    });
  });

  describe('property filters', () => {
    test('includes event property filters only on the events path', () => {
      nav.pathname = '/websites/1/events';
      const { eventPropertyFilters } = setup();

      expect(eventPropertyFilters).toEqual(['event-filter']);
      expect(parseUniversalEventPropertyFilters).toHaveBeenCalled();
    });

    test('excludes event property filters off the events path', () => {
      nav.pathname = '/websites/1';
      const { eventPropertyFilters } = setup();

      expect(eventPropertyFilters).toEqual([]);
      expect(parseUniversalEventPropertyFilters).not.toHaveBeenCalled();
    });

    test('always includes session property filters when allowed', () => {
      const { sessionPropertyFilters } = setup();

      expect(sessionPropertyFilters).toEqual(['session-filter']);
      expect(parseSessionPropertyFilters).toHaveBeenCalled();
    });

    test('excludes property filters when sharing disallows filtering', () => {
      shareValue = { parameters: { allowFilter: false } };
      nav.pathname = '/websites/1/events';
      const { eventPropertyFilters, sessionPropertyFilters } = setup();

      expect(eventPropertyFilters).toEqual([]);
      expect(sessionPropertyFilters).toEqual([]);
    });
  });

  describe('getFilters', () => {
    test('maps operator keys to labelled options for a known type', () => {
      const { getFilters } = setup();

      expect(getFilters('string')).toEqual([
        { type: 'string', value: 'eq', label: 'eq' },
        { type: 'string', value: 'neq', label: 'neq' },
        { type: 'string', value: 'c', label: 'c' },
        { type: 'string', value: 'dnc', label: 'dnc' },
        { type: 'string', value: 're', label: 're' },
        { type: 'string', value: 'nre', label: 'nre' },
      ]);
    });

    test('returns an empty array for an unknown type', () => {
      const { getFilters } = setup();
      expect(getFilters('nope')).toEqual([]);
    });
  });

  test('exposes the static operators list', () => {
    const { operators } = setup();

    expect(operators).toContainEqual({ name: 'gt', type: 'number', label: 'greaterThan' });
    expect(operators.filter(o => o.type === 'boolean')).toHaveLength(2);
  });
});
