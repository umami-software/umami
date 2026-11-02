import { describe, expect, test } from 'vitest';
import {
  allowShareFilter,
  applySharePresetFilters,
  excludeShareFilterParam,
  getShareTheme,
} from './share';

describe('allowShareFilter', () => {
  test('returns true when parameters are missing', () => {
    expect(allowShareFilter()).toBe(true);
    expect(allowShareFilter(null)).toBe(true);
  });

  test('returns true unless allowFilter is explicitly false', () => {
    expect(allowShareFilter({ allowFilter: true } as any)).toBe(true);
    expect(allowShareFilter({} as any)).toBe(true);
    expect(allowShareFilter({ allowFilter: false } as any)).toBe(false);
  });
  
  test('disables recipient filtering when preset filters are configured', () => {
    expect(allowShareFilter({ presetFilters: { country: 'eq.US' } } as any)).toBe(false);
  });
});

describe('getShareTheme', () => {
  test('returns light or dark when valid', () => {
    expect(getShareTheme({ theme: 'light' } as any)).toBe('light');
    expect(getShareTheme({ theme: 'dark' } as any)).toBe('dark');
  });

  test('returns undefined for missing or invalid themes', () => {
    expect(getShareTheme()).toBeUndefined();
    expect(getShareTheme(null)).toBeUndefined();
    expect(getShareTheme({ theme: 'blue' } as any)).toBeUndefined();
  });
});

describe('excludeShareFilterParam', () => {
  test('returns true for known filter columns', () => {
    expect(excludeShareFilterParam('path')).toBe(true);
    expect(excludeShareFilterParam('country')).toBe(true);
  });

  test('strips trailing digits before matching filter columns', () => {
    expect(excludeShareFilterParam('path2')).toBe(true);
  });

  test('returns true for reserved query params', () => {
    expect(excludeShareFilterParam('segment')).toBe(true);
    expect(excludeShareFilterParam('cohort')).toBe(true);
    expect(excludeShareFilterParam('match')).toBe(true);
    expect(excludeShareFilterParam('excludeBounce')).toBe(true);
  });

  test('returns false for unrelated keys', () => {
    expect(excludeShareFilterParam('foo')).toBe(false);
    expect(excludeShareFilterParam('constructor')).toBe(false);
  });
});

describe('applySharePresetFilters', () => {
  test('replaces requested filters with the configured preset filters', () => {
    expect(
      applySharePresetFilters(
        {
          country: 'eq.CA',
          path: 'eq./other',
          spf0: '1.eq.plan.free',
          search: 'query',
        },
        {
          presetFilters: {
            country: 'eq.US',
            path: 'eq./pricing',
            spf0: '1.eq.plan.pro',
            match: 'all',
          },
        } as any,
      ),
    ).toEqual({
      country: 'eq.US',
      path: 'eq./pricing',
      spf0: '1.eq.plan.pro',
      match: 'all',
      search: 'query',
    });
  });

  test('leaves the query unchanged when no preset filters exist', () => {
    const query = { country: 'eq.US' };

    expect(applySharePresetFilters(query)).toBe(query);
  });
});
