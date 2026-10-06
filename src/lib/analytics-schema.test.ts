import { describe, expect, test } from 'vitest';
import { breakdownQuerySchema, journeyQuerySchema, retentionQuerySchema } from './analytics-schema';

const range = { startAt: '1000', endAt: '2000' };

describe('analytics GET schemas', () => {
  test('decodes structured fields without losing escaped characters', () => {
    expect(
      breakdownQuerySchema.parse({ ...range, fields: JSON.stringify(['path', 'utmSource']) })
        .fields,
    ).toEqual(['path', 'utmSource']);
  });
  test.each(['{', '["not-a-field"]', '{}'])('rejects invalid fields: %s', fields => {
    expect(breakdownQuerySchema.safeParse({ ...range, fields }).success).toBe(false);
  });
  test('requires a finite, ordered timestamp range', () => {
    for (const input of [
      {},
      { startAt: 1000 },
      { startAt: 2000, endAt: 1000 },
      { startAt: 'NaN', endAt: 2000 },
      { startAt: 0, endAt: 1e20 },
    ]) {
      expect(retentionQuerySchema.safeParse(input).success).toBe(false);
    }
    expect(retentionQuerySchema.parse(range)).toMatchObject({ startAt: 1000, endAt: 2000 });
  });
  test('validates feature parameters', () => {
    expect(journeyQuerySchema.safeParse({ ...range, steps: 8 }).success).toBe(false);
    expect(journeyQuerySchema.parse({ ...range, steps: '3', eventType: '2' })).toMatchObject({
      steps: 3,
      eventType: 2,
    });
  });
});

describe('commerce GET schemas', () => {
  test('uppercases the currency and requires a three-letter code', async () => {
    const { commerceStatsQuerySchema } = await import('./analytics-schema');

    expect(commerceStatsQuerySchema.parse({ ...range, currency: 'eur' }).currency).toBe('EUR');
    expect(commerceStatsQuerySchema.safeParse(range).success).toBe(false);
    expect(commerceStatsQuerySchema.safeParse({ ...range, currency: 'EURO' }).success).toBe(false);
  });

  test('restricts dimensions, groupings and models to known values', async () => {
    const {
      commerceAttributionQuerySchema,
      commerceMetricsQuerySchema,
      commerceProductsQuerySchema,
    } = await import('./analytics-schema');
    const base = { ...range, currency: 'USD' };

    expect(commerceMetricsQuerySchema.safeParse({ ...base, type: 'channel' }).success).toBe(true);
    expect(commerceMetricsQuerySchema.safeParse({ ...base, type: 'url_path' }).success).toBe(false);
    expect(commerceProductsQuerySchema.safeParse({ ...base, sort: 'name; drop' }).success).toBe(
      false,
    );
    expect(
      commerceProductsQuerySchema.parse({ ...base, groupBy: 'category', page: '2' }),
    ).toMatchObject({ groupBy: 'category', page: 2 });
    expect(commerceAttributionQuerySchema.safeParse({ ...base, model: 'linear' }).success).toBe(
      false,
    );
  });

  test('breakdown accepts an optional revenue currency', async () => {
    const parsed = breakdownQuerySchema.parse({ ...range, fields: '["path"]', currency: 'gbp' });

    expect(parsed.currency).toBe('GBP');
    expect(breakdownQuerySchema.parse({ ...range, fields: '["path"]' }).currency).toBeUndefined();
  });
});
