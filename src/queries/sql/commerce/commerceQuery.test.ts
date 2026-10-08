import { describe, expect, test, vi } from 'vitest';

vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/umami?schema=public';
  delete process.env.DATABASE_REPLICA_URL;
});

import {
  getChannelSQL,
  getClickhouseCommerceQuery,
  getLookbackDate,
  getRelationalCommerceQuery,
  toNumber,
  toNumbers,
} from './commerceQuery';

const parameters = {
  startDate: new Date('2026-09-01T00:00:00.000Z'),
  endDate: new Date('2026-09-30T23:59:59.999Z'),
  currency: 'eur',
};

const squash = (sql: string) => sql.replace(/\s+/g, ' ');

describe('getRelationalCommerceQuery', () => {
  test('counts completed payments in one currency', () => {
    const { ctes, queryParams } = getRelationalCommerceQuery('website', parameters, {});

    expect(squash(ctes)).toContain('and commerce_event.order_id is not null');
    expect(squash(ctes)).toContain('commerce_event.currency = {{commerceCurrency}}');
    expect(queryParams.commerceCurrency).toBe('EUR');
    expect(queryParams.lookbackDate).toEqual(getLookbackDate(parameters.startDate));
  });

  test('joins filtered sessions only when filters apply', () => {
    expect(getRelationalCommerceQuery('website', parameters, {}).ctes).not.toContain(
      'filtered_sessions',
    );

    const filtered = getRelationalCommerceQuery('website', parameters, { country: 'DE' } as any);
    expect(filtered.isSessionFiltered).toBe(true);
    expect(squash(filtered.ctes)).toContain(
      'join filtered_sessions on filtered_sessions.session_id = commerce_event.session_id',
    );
  });
});

describe('getClickhouseCommerceQuery', () => {
  test('reads completed orders with FINAL', () => {
    const { ctes } = getClickhouseCommerceQuery('website', parameters, {});
    const sql = squash(ctes);

    expect(sql).toContain('from commerce_event final');
    expect(sql).toContain("and order_id != ''");
  });

  test('filters sessions with a subquery only when filters apply', () => {
    expect(getClickhouseCommerceQuery('website', parameters, {}).ctes).not.toContain(
      'filtered_sessions',
    );
    expect(
      getClickhouseCommerceQuery('website', parameters, { browser: 'chrome' } as any).ctes,
    ).toContain('session_id in (select session_id from filtered_sessions)');
  });
});

describe('helpers', () => {
  test('channel SQL escapes domain lists for both dialects', () => {
    expect(getChannelSQL('prisma', 've')).toContain(
      "ve.referrer_domain = '' and ve.url_query = ''",
    );
    expect(getChannelSQL('clickhouse', 've')).toContain('multiIf(');
  });

  test('normalizes database numbers', () => {
    expect(toNumber('12.5000')).toBe(12.5);
    expect(toNumber(BigInt(3))).toBe(3);
    expect(toNumber(null)).toBe(0);
    expect(toNumber({ toString: () => '7.25' })).toBe(7.25);
    expect(toNumbers({ a: '1', b: 'x' }, ['a'])).toEqual({ a: 1, b: 'x' });
  });
});
