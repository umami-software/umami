import { expect, test } from 'vitest';
import { getReportDeprecation } from './report-deprecations';

test('marks all legacy calculation and persistence routes with replacements', () => {
  for (const type of [
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
  ]) {
    expect(getReportDeprecation('post', `/api/reports/${type}`)).toContain(
      'GET /api/websites/{websiteId}/',
    );
  }
  expect(getReportDeprecation('get', '/api/reports')).toContain('persisted-data audit');
  expect(getReportDeprecation('delete', '/api/reports/{reportId}')).toContain(
    'Existing IDs are preserved',
  );
  expect(getReportDeprecation('get', '/api/websites/{websiteId}/reports')).toContain(
    'no removal date',
  );
});

test('does not deprecate the replacement feature APIs', () => {
  expect(getReportDeprecation('get', '/api/websites/{websiteId}/funnels/stats')).toBeUndefined();
  expect(getReportDeprecation('post', '/api/websites/{websiteId}/funnels')).toBeUndefined();
  expect(getReportDeprecation('get', '/api/websites/{websiteId}/revenue/stats')).toBeUndefined();
});
