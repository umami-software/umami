import { describe, expect, test } from 'vitest';
import { collectionSchema } from './request-schema';

const website = '11111111-1111-4111-8111-111111111111';

function parse(payload: Record<string, any>, type = 'event') {
  return collectionSchema.safeParse({ type, payload: { website, ...payload } });
}

function nest(depth: number) {
  const root: Record<string, any> = {};
  let node = root;

  for (let i = 1; i < depth; i++) {
    node.a = {};
    node = node.a;
  }

  return root;
}

// Data is written after the event row, so input that would fail on write must be
// rejected up front instead of producing a 500 and a partial write.
describe('collectionSchema data', () => {
  test('accepts typical event data', () => {
    expect(
      parse({
        data: { plan: 'pro', price: 19.99, tags: ['a', 'b'], meta: { seats: 5 }, ok: true },
      }).success,
    ).toBe(true);
  });

  test('accepts nesting up to 32 levels and rejects deeper', () => {
    expect(parse({ data: nest(32) }).success).toBe(true);
    expect(parse({ data: nest(33) }).success).toBe(false);
  });

  test('rejects deep nesting inside arrays', () => {
    expect(parse({ data: { list: [nest(40)] } }).success).toBe(false);
  });

  test('rejects numbers that overflow Decimal(19,4)', () => {
    expect(parse({ data: { n: 999999999999999 } }).success).toBe(true);
    expect(parse({ data: { n: 1e15 } }).success).toBe(false);
    expect(parse({ data: { n: -1e15 } }).success).toBe(false);
    expect(parse({ data: { nested: { n: 1e20 } } }).success).toBe(false);
  });

  // Arrays are stored as JSON strings, so large numbers inside them never hit the decimal column.
  test('allows large numbers inside arrays', () => {
    expect(parse({ data: { ids: [1e20] } }).success).toBe(true);
  });

  test('applies the same limits to identify data', () => {
    expect(parse({ data: { n: 1e15 } }, 'identify').success).toBe(false);
  });
});

describe('collectionSchema revenue', () => {
  test('accepts realistic revenue', () => {
    expect(parse({ data: { revenue: 49.99, currency: 'USD' } }).success).toBe(true);
    expect(parse({ data: { revenue: '1200.50', currency: 'EUR' } }).success).toBe(true);
  });

  test('rejects revenue that overflows ClickHouse Decimal(18,4)', () => {
    expect(parse({ data: { revenue: 1e14, currency: 'USD' } }).success).toBe(false);
    expect(parse({ data: { revenue: '1e14', currency: 'USD' } }).success).toBe(false);
  });

  // Without a currency, or on identify, revenue is never written, so it must not be rejected.
  test('ignores large revenue that would not be saved as revenue', () => {
    expect(parse({ data: { revenue: '1e14' } }).success).toBe(true);
    expect(parse({ data: { revenue: '1e14', currency: 'USD' } }, 'identify').success).toBe(true);
  });
});

describe('collectionSchema hostname', () => {
  test('accepts empty, plain, port and IDN hostnames', () => {
    expect(parse({ hostname: '' }).success).toBe(true);
    expect(parse({ hostname: 'example.com' }).success).toBe(true);
    expect(parse({ hostname: 'localhost:3000' }).success).toBe(true);
    expect(parse({ hostname: 'bücher.de' }).success).toBe(true);
  });

  test('rejects hostnames that cannot form a URL', () => {
    expect(parse({ hostname: 'exa mple.com' }).success).toBe(false);
    expect(parse({ hostname: 'a:b:c' }).success).toBe(false);
  });
});

describe('collectionSchema timestamp', () => {
  test('accepts historical and current unix seconds', () => {
    expect(parse({ timestamp: 0 }).success).toBe(true);
    expect(parse({ timestamp: 1767225600 }).success).toBe(true);
    expect(parse({ timestamp: '1767225600' }).success).toBe(true);
  });

  test('rejects timestamps outside 1970 to 2038', () => {
    expect(parse({ timestamp: -1 }).success).toBe(false);
    expect(parse({ timestamp: 2147483648 }).success).toBe(false);
    expect(parse({ timestamp: 1e15 }).success).toBe(false);
  });
});
