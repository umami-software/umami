import { expect, test } from 'vitest';
import { serializeAnalyticsQuery } from './analytics-query';
import { funnelQuerySchema } from './analytics-schema';

test('structured funnel criteria survive GET URL encoding and validation', () => {
  const steps = [
    {
      type: 'path',
      value: '/pricing?plan=a&b="c"',
      filters: [{ property: 'a.b', operator: 'eq', value: '日本語 + / ? #' }],
    },
    { type: 'event', value: 'signup' },
  ];
  const query = serializeAnalyticsQuery({
    websiteId: 'website',
    startDate: new Date(1000),
    endDate: new Date(2000),
    steps,
    window: 60,
    browser1: 'eq.Chrome',
    unused: undefined,
  });
  const url = new URL(`https://example.org?${new URLSearchParams(query)}`);
  expect(funnelQuerySchema.parse(Object.fromEntries(url.searchParams)).steps).toEqual(steps);
  expect(url.searchParams.get('browser1')).toBe('eq.Chrome');
  expect(url.searchParams.has('websiteId')).toBe(false);
  expect(url.searchParams.has('unused')).toBe(false);
});

test('explicit dates win over default timestamps', () => {
  expect(
    serializeAnalyticsQuery({
      startAt: 0,
      endAt: 100,
      startDate: new Date(1000),
      endDate: new Date(2000),
    }),
  ).toEqual({ startAt: 1000, endAt: 2000 });
});
