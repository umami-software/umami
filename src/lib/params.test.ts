import { describe, expect, test } from 'vitest';
import { DATA_TYPE, OPERATORS } from './constants';
import {
  filtersObjectToArray,
  parsePropertyFilters,
  parseSessionPropertyFilters,
  parseUniversalEventPropertyFilters,
  serializePropertyFilters,
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

describe('filtersObjectToArray', () => {
  // name and paramName become SQL placeholder names ({{name}} / {name:Type}).
  // Object filters arrive from request bodies (compat Reports API), so letting them
  // pick those names allows breaking out of the placeholder into raw SQL.
  const injection = 'p}} or 1=1 --';

  test('ignores client-supplied paramName in object filters', () => {
    const [filter] = filtersObjectToArray({
      entry: { name: 'entry', operator: OPERATORS.contains, value: 'x', paramName: injection },
    } as any);

    expect(filter.name).toBe('entry');
    expect(filter.paramName).toBeUndefined();
  });

  test('ignores client-supplied name in object filters', () => {
    const [filter] = filtersObjectToArray({
      entry: { name: injection, operator: OPERATORS.contains, value: 'x' },
    } as any);

    expect(filter.name).toBe('entry');
    expect(filter.paramName).toBeUndefined();
  });

  test('keeps numbered keys as distinct params for repeated filters', () => {
    const [filter] = filtersObjectToArray({
      path1: { name: 'path', operator: OPERATORS.equals, value: '/a', paramName: injection },
    } as any);

    expect(filter.name).toBe('path');
    expect(filter.paramName).toBe('path1');
    expect(filter.value).toBe('/a');
  });

  // prefix and column are concatenated into the column expression, so a client value
  // there is raw SQL. Only operator and value may come from the request body.
  test('ignores client-supplied prefix and column in object filters', () => {
    const [filter] = filtersObjectToArray({
      path1: {
        name: 'path',
        operator: OPERATORS.equals,
        value: '/a',
        prefix: injection,
        column: injection,
      },
    } as any);

    expect(filter).toEqual({
      name: 'path',
      paramName: 'path1',
      column: 'url_path',
      operator: OPERATORS.equals,
      value: '/a',
      prefix: undefined,
    });
  });

  test('keeps server-supplied prefix for object filters', () => {
    const [filter] = filtersObjectToArray(
      { path: { name: 'path', operator: OPERATORS.equals, value: '/a', prefix: injection } } as any,
      { prefix: 'e.' },
    );

    expect(filter.prefix).toBe('e.');
  });
});

describe('property filter params', () => {
  const filter = (propertyName: string, value = 'x') => ({
    propertyName,
    dataType: DATA_TYPE.string,
    operator: OPERATORS.equals,
    value,
  });

  test('keeps the trailing digits of a property name', () => {
    const filters = [filter('player-1'), filter('step2', 'b'), filter('item_10', 'c')];

    expect(parsePropertyFilters(serializePropertyFilters(filters))).toEqual(filters);
  });

  test('tells repeated filters of one name from a name that ends in a digit', () => {
    const filters = [filter('a', '1'), filter('a', '2'), filter('a1', '3'), filter('a1', '4')];
    const params = serializePropertyFilters(filters);

    expect(Object.keys(params)).toHaveLength(4);
    expect(parsePropertyFilters(params)).toEqual(filters);
  });

  test('keeps the key format of names without a trailing digit', () => {
    const params = serializePropertyFilters([filter('plan'), filter('plan'), filter('plan')]);

    expect(Object.keys(params)).toEqual(['pf_plan', 'pf_plan1', 'pf_plan2']);
  });
});
