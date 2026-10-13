import { expect, test } from 'vitest';
import { collectionSchema } from './request-schema';

const parse = (payload: Record<string, unknown>) =>
  collectionSchema.safeParse({
    type: 'event',
    payload: { website: '3f9f8d5c-1d3a-4c6e-9b1a-2f3e4d5c6b7a', ...payload },
  });

test('accepts country, region and city overrides', () => {
  expect(parse({ country: 'DE', region: 'DE-BE', city: 'Berlin' }).success).toBe(true);
  expect(parse({ country: 'US', region: 'CA' }).success).toBe(true);
  expect(parse({ country: 'GB', region: 'GB-ENG' }).success).toBe(true);
});

test('rejects country values that are not ISO 3166-1 alpha-2 codes', () => {
  expect(parse({ country: 'de' }).success).toBe(false);
  expect(parse({ country: 'DEU' }).success).toBe(false);
});

test('rejects region values that are not ISO 3166-2 subdivision codes', () => {
  expect(parse({ country: 'US', region: 'California' }).success).toBe(false);
  expect(parse({ country: 'US', region: 'us-ca' }).success).toBe(false);
});

test('rejects cities longer than the column allows', () => {
  expect(parse({ country: 'US', city: 'x'.repeat(51) }).success).toBe(false);
});

test('requires country when region or city is provided', () => {
  const result = parse({ city: 'Berlin' });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]).toMatchObject({ path: ['payload', 'country'] });
});

test('rejects a region prefixed with a different country', () => {
  const result = parse({ country: 'DE', region: 'US-CA' });

  expect(result.success).toBe(false);
  expect(result.error?.issues[0]).toMatchObject({ path: ['payload', 'region'] });
});
