import { describe, expect, test } from 'vitest';
import { DATA_TYPE, OPERATORS } from './constants';
import {
  boardRowFiltersToParams,
  mergeFilterParams,
  parseSessionPropertyFilters,
  parseUniversalEventPropertyFilters,
  serializeSessionPropertyFilters,
  serializeUniversalEventPropertyFilters,
} from './params';

describe('session property filter params', () => {
  test('serializes and parses session property filters', () => {
    const filters = [
      {
        propertyName: 'user.id',
        dataType: DATA_TYPE.string,
        operator: OPERATORS.equals,
        value: 'abc.123,xyz',
      },
      {
        propertyName: 'created at',
        dataType: DATA_TYPE.date,
        operator: OPERATORS.before,
        value: '2026-07-01',
      },
    ];

    const params = serializeSessionPropertyFilters(filters);

    expect(params).toEqual({
      spf0: '1.eq.user%2Eid.abc.123,xyz',
      spf1: '4.bf.created%20at.2026-07-01',
    });
    expect(parseSessionPropertyFilters(params)).toEqual(filters);
  });

  test('ignores malformed session property filters', () => {
    expect(
      parseSessionPropertyFilters({
        spf0: 'eq.user%2Eid.value',
        spf1: '1.unknown.email.value',
        spf2: '1.eq',
      }),
    ).toEqual([]);
  });

  test('serializes and parses universal event property filters', () => {
    const filters = [
      {
        propertyName: 'plan.id',
        dataType: DATA_TYPE.string,
        operator: OPERATORS.equals,
        value: 'pro,team',
      },
    ];

    const params = serializeUniversalEventPropertyFilters(filters);

    expect(params).toEqual({
      epf0: '1.eq.plan%2Eid.pro,team',
    });
    expect(parseUniversalEventPropertyFilters(params)).toEqual(filters);
  });

  test('ignores malformed universal event property filters', () => {
    expect(
      parseUniversalEventPropertyFilters({
        epf0: 'eq.plan%2Eid.value',
        epf1: '1.unknown.email.value',
        epf2: '1.eq',
      }),
    ).toEqual([]);
  });
});

describe('mergeFilterParams', () => {
  test('adds params that do not collide', () => {
    expect(mergeFilterParams({ path: 'eq./home' }, { browser: 'eq.chrome' })).toEqual({
      path: 'eq./home',
      browser: 'eq.chrome',
    });
  });

  test('renumbers a colliding field filter instead of replacing it', () => {
    expect(mergeFilterParams({ path: 'eq./home' }, { path: 'eq./about' })).toEqual({
      path: 'eq./home',
      path1: 'eq./about',
    });
  });

  test('renumbers session property filters into the next free slot', () => {
    expect(
      mergeFilterParams({ spf0: '1.eq.a.1', spf1: '1.eq.b.2' }, { spf0: '1.eq.c.3' }),
    ).toEqual({
      spf0: '1.eq.a.1',
      spf1: '1.eq.b.2',
      spf2: '1.eq.c.3',
    });
  });

  test('leaves single-valued params to the caller', () => {
    expect(
      mergeFilterParams({ segment: 'a' }, { segment: 'b', cohort: 'c', match: 'any' }),
    ).toEqual({ segment: 'a' });
  });
});

describe('boardRowFiltersToParams', () => {
  test('returns nothing without filters', () => {
    expect(boardRowFiltersToParams()).toEqual({});
    expect(boardRowFiltersToParams({})).toEqual({});
  });

  test('serializes field filters, session properties and segment refs', () => {
    expect(
      boardRowFiltersToParams({
        filters: [{ name: 'path', operator: OPERATORS.equals, value: '/home' }],
        sessionPropertyFilters: [
          {
            propertyName: 'user_region',
            dataType: DATA_TYPE.string,
            operator: OPERATORS.equals,
            value: 'VastraGotaland',
          },
        ],
        segment: 'seg-id',
        match: 'any',
      }),
    ).toEqual({
      path: `${OPERATORS.equals}./home`,
      spf0: `${DATA_TYPE.string}.${OPERATORS.equals}.user_region.VastraGotaland`,
      segment: 'seg-id',
      match: 'any',
    });
  });
});
