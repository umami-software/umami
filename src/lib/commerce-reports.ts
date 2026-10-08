import { z } from 'zod';

/*
 * Commerce report vocabulary and API shapes. Pure (no database imports) so it can be
 * shared by query modules, request schemas, OpenAPI contracts and the client.
 */

/** How far before the selected range acquisition touches and visit entries are searched. */
export const COMMERCE_LOOKBACK_DAYS = 30;

/** Order attributes, visitor attributes of the purchasing session, and visit acquisition. */
export const COMMERCE_METRIC_TYPES = [
  'market',
  'event',
  'country',
  'region',
  'city',
  'device',
  'browser',
  'os',
  'language',
  'referrer',
  'channel',
  'entry',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
] as const;

export const COMMERCE_ATTRIBUTION_MODELS = ['first-click', 'last-click'] as const;
export const COMMERCE_ATTRIBUTION_DIMENSIONS = [
  'channel',
  'referrer',
  'paidAds',
  'entry',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
] as const;

export type CommerceMetricType = (typeof COMMERCE_METRIC_TYPES)[number];
export type CommerceAttributionModel = (typeof COMMERCE_ATTRIBUTION_MODELS)[number];
export type CommerceAttributionDimension = (typeof COMMERCE_ATTRIBUTION_DIMENSIONS)[number];

// ---- response shapes ----------------------------------------------------------------

const money = z.number().describe('Amount in the requested currency.');
const count = z.number();

export const commerceCurrencySchema = z.object({
  currency: z.string(),
  orders: count.describe('Completed orders.'),
  revenue: money,
  events: count.describe('Recorded orders and refunds.'),
});

export const commerceStatsSchema = z.object({
  revenue: money.nullable(),
  refundAmount: money.nullable(),
  netRevenue: money.nullable(),
  subtotal: money.nullable(),
  tax: money.nullable(),
  shipping: money.nullable(),
  orders: count,
  buyers: count,
  visitors: count,
  visits: count,
  convertedVisits: count,
  averageOrderValue: money.nullable(),
  conversionRate: z
    .number()
    .nullable()
    .describe('Converted visits divided by visits; unavailable for commerce-scoped traffic.'),
  revenuePerVisitor: money.nullable(),
});

export const commerceStatsResponseSchema = commerceStatsSchema.extend({
  comparison: commerceStatsSchema,
});

export const commerceChartResponseSchema = z.object({
  chart: z.array(
    z.object({
      x: z.string().describe('Event name.'),
      t: z.string().describe('Time bucket.'),
      y: money.nullable().describe('Revenue.'),
      count: count.describe('Orders.'),
    }),
  ),
});

export const commerceMetricSchema = z.object({
  name: z.string(),
  revenue: money.nullable(),
  orders: count,
  buyers: count,
  country: z.string().optional(),
});

const pageShape = {
  count: z.number(),
  page: z.number(),
  pageSize: z.number(),
};

export const commerceOrderSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  eventName: z.string(),
  market: z.string(),
  currency: z.string(),
  sessionId: z.string().nullable(),
  visitId: z.string().nullable(),
  createdAt: z.string(),
  subtotal: money.nullable(),
  shipping: money.nullable(),
  tax: money.nullable(),
  total: money,
  country: z.string(),
  device: z.string(),
  browser: z.string(),
  os: z.string(),
});

export const commerceOrdersResponseSchema = z.object({
  ...pageShape,
  data: z.array(commerceOrderSchema),
});

export const commerceOrderDetailSchema = z.object({
  id: z.string(),
  eventName: z.string(),
  currency: z.string(),
  market: z.string(),
  source: z.string(),
  customerId: z.string(),
  orderId: z.string(),
  sessionId: z.string().nullable(),
  visitId: z.string().nullable(),
  createdAt: z.string(),
  subtotal: money.nullable(),
  shipping: money.nullable(),
  tax: money.nullable(),
  total: money,
  refunds: z.array(z.object({ refundId: z.string(), total: money, createdAt: z.string() })),
  items: z.array(
    z.object({
      index: z.number(),
      lineId: z.string(),
      productId: z.string(),
      name: z.string(),
      variant: z.string(),
      category: z.string(),
      price: money.nullable(),
      total: money.nullable(),
    }),
  ),
});

export const commerceCustomersResponseSchema = z.object({
  buyers: count,
  newBuyers: count,
  returningBuyers: count,
  repeatBuyers: count,
  repeatRate: z.number(),
  orders: count,
  revenue: money.nullable(),
  revenuePerBuyer: money.nullable(),
  ordersPerBuyer: z.number(),
  newRevenue: money.nullable(),
  returningRevenue: money.nullable(),
  medianSecondsToFirstOrder: z.number().nullable(),
  medianVisitsToFirstOrder: z.number().nullable(),
});

export const commerceBuyersResponseSchema = z.object({
  ...pageShape,
  data: z.array(
    z.object({
      buyerId: z.string(),
      distinctId: z.string(),
      sessionId: z.string().nullable(),
      sessions: count,
      orders: count,
      revenue: money.nullable(),
      firstOrderAt: z.string(),
      lastOrderAt: z.string(),
      isNew: z.boolean(),
    }),
  ),
});

const attributionRows = z.array(
  z.object({ name: z.string(), revenue: money.nullable(), orders: count }),
);

export const commerceAttributionResponseSchema = z.object({
  model: z.enum(COMMERCE_ATTRIBUTION_MODELS),
  lookbackDays: z.number(),
  total: z.object({ revenue: money.nullable(), orders: count }),
  channel: attributionRows,
  referrer: attributionRows,
  paidAds: attributionRows,
  entry: attributionRows,
  utmSource: attributionRows,
  utmMedium: attributionRows,
  utmCampaign: attributionRows,
  utmContent: attributionRows,
  utmTerm: attributionRows,
});

// ---- request helpers ----------------------------------------------------------------

export interface CommerceRequestParameters {
  startDate: Date;
  endDate: Date;
  unit?: string;
  timezone?: string;
  currency: string;
  market?: string;
}

/**
 * Commerce parameters from a parsed request. Dates come from the normalized query
 * filters, so website reset dates and account history limits apply.
 */
export function getCommerceRequestParameters(
  query: {
    currency?: string;
    market?: string;
  },
  filters: { startDate?: Date; endDate?: Date; unit?: string; timezone?: string },
): CommerceRequestParameters {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    unit: filters.unit,
    timezone: filters.timezone,
    currency: query.currency?.toUpperCase(),
    market: query.market || undefined,
  };
}
