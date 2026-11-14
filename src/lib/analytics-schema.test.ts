import { describe, expect, test } from 'vitest';
import {
  breakdownQuerySchema,
  heatmapQuerySchema,
  journeyQuerySchema,
  retentionQuerySchema,
} from './analytics-schema';

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

describe('visit duration params', () => {
  const visitParams = { ...range, minVisitDuration: '60', maxVisitDuration: '600' };

  test('are accepted by reports that apply the visit-level join', () => {
    expect(breakdownQuerySchema.parse({ ...visitParams, fields: '["path"]' })).toMatchObject({
      minVisitDuration: 60,
      maxVisitDuration: 600,
    });
    expect(heatmapQuerySchema.parse(visitParams)).toMatchObject({ minVisitDuration: 60 });
  });

  test('are dropped by reports that would ignore them', () => {
    // journeys and retention never join to visits, so the bounds must not reach their filters
    expect(journeyQuerySchema.parse({ ...visitParams, steps: '3' })).not.toHaveProperty(
      'minVisitDuration',
    );
    expect(retentionQuerySchema.parse(visitParams)).not.toHaveProperty('maxVisitDuration');
  });

  test('reject negative or fractional seconds', () => {
    expect(heatmapQuerySchema.safeParse({ ...range, minVisitDuration: '-1' }).success).toBe(false);
    expect(heatmapQuerySchema.safeParse({ ...range, minVisitDuration: '1.5' }).success).toBe(false);
  });
});
