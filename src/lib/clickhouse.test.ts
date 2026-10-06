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

describe('getDateSQL bucket formatting', () => {
  // Regression: getDateSQL used to return a native DateTime whose "iso" serialization
  // is a genuine UTC instant - unlike Postgres's already-shifted-but-Z-labeled value,
  // which the frontend assumes for every backend. formatDateTime makes it match.
  test('formats an explicit "Z" via formatDateTime instead of relying on native DateTime serialization', () => {
    expect(clickhouse.getDateSQL('website_event.created_at', 'hour', 'Asia/Tokyo')).toBe(
      `formatDateTime(date_trunc('hour', website_event.created_at, 'Asia/Tokyo'), '%Y-%m-%dT%H:00:00Z', 'Asia/Tokyo')`,
    );
  });

  test('omits the timezone argument to formatDateTime when no timezone is given', () => {
    expect(clickhouse.getDateSQL('website_event.created_at', 'day')).toBe(
      `formatDateTime(date_trunc('day', website_event.created_at), '%Y-%m-%dT00:00:00Z')`,
    );
  });

  test('covers every bucket unit with an explicit "Z"', () => {
    expect(clickhouse.getDateSQL('created_at', 'minute', 'UTC')).toBe(
      `formatDateTime(date_trunc('minute', created_at, 'UTC'), '%Y-%m-%dT%R:00Z', 'UTC')`,
    );
    expect(clickhouse.getDateSQL('created_at', 'month', 'UTC')).toBe(
      `formatDateTime(date_trunc('month', created_at, 'UTC'), '%Y-%m-01T00:00:00Z', 'UTC')`,
    );
    expect(clickhouse.getDateSQL('created_at', 'year', 'UTC')).toBe(
      `formatDateTime(date_trunc('year', created_at, 'UTC'), '%Y-01-01T00:00:00Z', 'UTC')`,
    );
  });
});
