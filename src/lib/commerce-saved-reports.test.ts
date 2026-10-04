import { describe, expect, test } from 'vitest';
import {
  commerceReportDefinitionSchema,
  commerceReportParametersSchema,
  resolveCommerceReportDates,
} from './commerce-saved-reports';

const report = { version: 1, type: 'products', currency: 'EUR' };
describe('commerce definitions', () => {
  test('validates all persisted scope and rejects query overrides hidden in filters', () => {
    expect(
      commerceReportParametersSchema.safeParse({ ...report, filters: { currency: 'USD' } }).success,
    ).toBe(false);
    expect(commerceReportParametersSchema.safeParse({ ...report, maxCartRate: 2 }).success).toBe(
      false,
    );
    expect(commerceReportParametersSchema.safeParse({ ...report, columns: [] }).success).toBe(
      false,
    );
    expect(
      commerceReportDefinitionSchema.safeParse({ name: ' ', parameters: report }).success,
    ).toBe(false);
    expect(
      commerceReportParametersSchema.parse({
        ...report,
        filters: { country: 'DE', browser1: 'Chrome' },
      }).filters.country,
    ).toBe('DE');
  });
  test('rolling reports advance by calendar days in their saved timezone, including DST', () => {
    const definition = commerceReportParametersSchema.parse({
      ...report,
      timezone: 'Europe/Berlin',
      date: { mode: 'rolling', days: 30 },
    });
    const first = resolveCommerceReportDates(definition, new Date('2026-03-28T12:00:00Z'));
    const next = resolveCommerceReportDates(definition, new Date('2026-03-29T12:00:00Z'));
    expect(next.startAt - first.startAt).toBe(86400000);
    expect(next.endAt - first.endAt).toBe(23 * 3600000);
  });
  test('fixed reports preserve instants across reopening', () => {
    const definition = commerceReportParametersSchema.parse({
      ...report,
      date: { mode: 'fixed', startAt: 1000, endAt: 2000 },
    });
    expect(resolveCommerceReportDates(definition)).toEqual({ startAt: 1000, endAt: 2000 });
  });
});
