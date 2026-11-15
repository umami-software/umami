import {
  getRewrittenUrl,
  isRewrite,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';
import { describe, expect, test } from 'vitest';
import nextConfig from '../../next.config';

describe('legacy report compatibility routing', () => {
  test.each([
    '/api/reports',
    '/api/reports/saved-report-id',
    ...[
      'attribution',
      'breakdown',
      'funnel',
      'goal',
      'heatmap',
      'journey',
      'performance',
      'retention',
      'revenue',
      'utm',
    ].map(type => `/api/reports/${type}`),
    '/api/websites/website-id/reports',
  ])('rewrites %s while preserving query parameters', async path => {
    const query = '?websiteId=website-id&type=funnel&page=2';
    const response = await unstable_getResponseFromNextConfig({
      url: `https://example.com${path}${query}`,
      nextConfig: { ...nextConfig, basePath: '' },
    });

    expect(isRewrite(response)).toBe(true);
    expect(response.headers.get('location')).toBeNull();
    expect(getRewrittenUrl(response)).toBe(`https://example.com/compat${path}${query}`);
  });

  test('leaves feature routes unchanged', async () => {
    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/api/websites/website-id/funnels',
      nextConfig: { ...nextConfig, basePath: '' },
    });

    expect(isRewrite(response)).toBe(false);
  });

  test('preserves a configured base path', async () => {
    const response = await unstable_getResponseFromNextConfig({
      url: 'https://example.com/umami/api/reports/funnel?websiteId=website-id',
      nextConfig: { ...nextConfig, basePath: '/umami' },
    });

    expect(getRewrittenUrl(response)).toBe(
      'https://example.com/umami/compat/api/reports/funnel?websiteId=website-id',
    );
  });
});
