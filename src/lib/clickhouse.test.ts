import { describe, expect, test } from 'vitest';
import { CLICKHOUSE_DATE_FORMATS } from './clickhouse';

describe('CLICKHOUSE_DATE_FORMATS', () => {
  test('uses date format tokens compatible with ClickHouse 22.8 and newer', () => {
    expect(CLICKHOUSE_DATE_FORMATS).toMatchObject({
      utc: '%Y-%m-%dT%TZ',
      second: '%Y-%m-%dT%T',
      minute: '%Y-%m-%d %R:00',
    });
  });
});
