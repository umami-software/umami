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
