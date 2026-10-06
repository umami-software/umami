import { fromZonedTime } from 'date-fns-tz';
import { z } from 'zod';
import { COMMERCE_PRODUCT_GROUPS, COMMERCE_PRODUCT_SORTS } from './commerce-reports';
import { FILTER_COLUMNS } from './constants';
import { parseDateRange } from './date';
import { timezoneParam } from './schema';

export const COMMERCE_COLUMNS = [
  'views',
  'additions',
  'addToCartRate',
  'purchaseRate',
  'cartToPurchaseRate',
  'units',
  'orders',
  'averagePrice',
  'revenue',
] as const;
const filterKey = z
  .string()
  .refine(
    key =>
      !!FILTER_COLUMNS[key.replace(/\d+$/, '')] ||
      /^spf\d+$/.test(key) ||
      ['segment', 'cohort', 'match', 'excludeBounce'].includes(key),
    'Unsupported report filter',
  );
export const commerceReportParametersSchema = z
  .object({
    version: z.literal(1),
    type: z.enum(['products', 'checkout']),
    currency: z.string().regex(/^[A-Z]{3}$/),
    market: z.string().max(200).optional(),
    productId: z.string().max(200).optional(),
    category: z.string().max(200).optional(),
    groupBy: z.enum(COMMERCE_PRODUCT_GROUPS).default('product'),
    sort: z.enum(COMMERCE_PRODUCT_SORTS).default('revenue'),
    minViews: z.number().int().min(0).default(0),
    maxCartRate: z.number().min(0).max(1).default(1),
    windowHours: z.number().int().min(1).max(720).default(24),
    search: z.string().max(200).default(''),
    columns: z
      .array(z.enum(COMMERCE_COLUMNS))
      .min(1)
      .max(COMMERCE_COLUMNS.length)
      .default([...COMMERCE_COLUMNS]),
    filters: z.record(filterKey, z.string().max(2000)).default({}),
    timezone: timezoneParam.default('UTC'),
    date: z
      .discriminatedUnion('mode', [
        z.object({ mode: z.literal('rolling'), days: z.number().int().min(1).max(730) }).strict(),
        z
          .object({
            mode: z.literal('fixed'),
            startAt: z.number().int().min(0).max(8640000000000000),
            endAt: z.number().int().min(0).max(8640000000000000),
          })
          .strict()
          .refine(value => value.endAt >= value.startAt, 'Invalid date range'),
      ])
      .default({ mode: 'rolling', days: 30 }),
  })
  .strict();
export type CommerceReportParameters = z.infer<typeof commerceReportParametersSchema>;
export const commerceReportDefinitionSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().max(500).default(''),
    parameters: commerceReportParametersSchema,
  })
  .strict();
export interface SavedCommerceReport {
  id: string;
  name: string;
  description: string;
  websiteId: string;
  parameters: CommerceReportParameters;
}

/** Fixed ranges preserve instants. Rolling ranges are resolved afresh on every request. */
export function resolveCommerceReportDates(parameters: CommerceReportParameters, now = new Date()) {
  if (parameters.date.mode === 'fixed')
    return { startAt: parameters.date.startAt, endAt: parameters.date.endAt };
  const range = parseDateRange(
    `${parameters.date.days}day`,
    undefined,
    'en-US',
    parameters.timezone,
    now,
  );
  return {
    startAt: +fromZonedTime(range.startDate, parameters.timezone),
    endAt: +fromZonedTime(range.endDate, parameters.timezone),
  };
}

export const savedCommerceStatsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    // Board dates may override the saved range, but never its filters or currency.
    startAt: z.coerce.number().int().min(0).max(8640000000000000).optional(),
    endAt: z.coerce.number().int().min(0).max(8640000000000000).optional(),
  })
  .refine(
    value =>
      (value.startAt === undefined && value.endAt === undefined) ||
      (value.startAt !== undefined && value.endAt !== undefined && value.endAt >= value.startAt),
    'Supply both dates in order',
  );
