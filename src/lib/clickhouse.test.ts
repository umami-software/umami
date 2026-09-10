import { describe, expect, test } from 'vitest';
import clickhouse, { CLICKHOUSE_DATE_FORMATS } from './clickhouse';

describe('CLICKHOUSE_DATE_FORMATS', () => {
  test('uses date format tokens compatible with ClickHouse 22.8 and newer', () => {
    expect(CLICKHOUSE_DATE_FORMATS).toMatchObject({
      utc: '%Y-%m-%dT%TZ',
      second: '%Y-%m-%dT%T',
      minute: '%Y-%m-%d %R:00',
    });
  });
});

describe('wildcard filters (clickhouse)', () => {
  test('matches operator emits ILIKE against the column', () => {
    const sql = clickhouse.getFilterQuery({
      path: { name: 'path', operator: 'wc', value: '/blog/*' },
    });

    expect(sql).toContain('url_path ILIKE {path:String}');
  });

  test('doesNotMatch operator emits NOT ILIKE', () => {
    const sql = clickhouse.getFilterQuery({
      path: { name: 'path', operator: 'nwc', value: '/admin/*' },
    });

    expect(sql).toContain('url_path NOT ILIKE {path:String}');
  });

  test('a mid-string * is escaped, not translated', () => {
    const { queryParams } = clickhouse.parseFilters({
      path: { name: 'path', operator: 'wc', value: '/blog/*/comments' },
    });

    expect(queryParams.path).toBe('/blog/*/comments');
  });

  // one assertion per property-filter builder, because the string branch is
  // duplicated three times in clickhouse.ts and it is easy to patch only one copy
  test('getEventPropertyFilterQuery supports wildcards', () => {
    const { filterQuery, queryParams } = clickhouse.parseFilters({
      eventPropertyFilters: [
        { propertyName: 'file', dataType: 1, operator: 'wc', value: 'liberica-*' },
      ],
    });

    expect(filterQuery).toContain('string_value ILIKE');
    expect(Object.values(queryParams)).toContain('liberica-%');
  });

  test('getSessionPropertyFilterQuery supports wildcards', () => {
    const { filterQuery, queryParams } = clickhouse.parseFilters({
      sessionPropertyFilters: [
        { propertyName: 'plan', dataType: 1, operator: 'nwc', value: 'trial-*' },
      ],
    });

    expect(filterQuery).toContain('string_value NOT ILIKE');
    expect(Object.values(queryParams)).toContain('trial-%');
  });

  test('getPropertyFilterQuery supports wildcards', () => {
    const { sql, params } = clickhouse.getPropertyFilterQuery(
      [{ propertyName: 'file', dataType: 1, operator: 'wc', value: 'liberica-*' }],
      'event',
    );

    expect(sql).toContain('string_value ILIKE');
    expect(Object.values(params)).toContain('liberica-%');
  });
});
