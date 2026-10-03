import { z } from 'zod';

/*
 * Commerce report vocabulary and API shapes. Pure (no database imports) so it can be
 * shared by query modules, request schemas, OpenAPI contracts and the client.
 */

/** How far before the selected range acquisition touches and visit entries are searched. */
export const COMMERCE_LOOKBACK_DAYS = 30;

export const COMMERCE_STAGES = ['cart', 'checkout', 'order'] as const;

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

export const COMMERCE_PRODUCT_GROUPS = ['product', 'variant', 'category'] as const;
export const COMMERCE_PRODUCT_SORTS = [
  'revenue',
  'units',
  'orders',
  'views',
  'additions',
  'addToCartRate',
  'purchaseRate',
  'cartToPurchaseRate',
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
export type CommerceProductGroup = (typeof COMMERCE_PRODUCT_GROUPS)[number];
export type CommerceProductSort = (typeof COMMERCE_PRODUCT_SORTS)[number];
export type CommerceAttributionModel = (typeof COMMERCE_ATTRIBUTION_MODELS)[number];
export type CommerceAttributionDimension = (typeof COMMERCE_ATTRIBUTION_DIMENSIONS)[number];

// ---- response shapes ----------------------------------------------------------------

const money = z.number().describe('Amount in the requested currency.');
const count = z.number();

export const commerceCurrencySchema = z.object({
  currency: z.string(),
  orders: count.describe('Completed orders.'),
  revenue: money,
  events: count.describe('All commerce events, including carts and checkouts.'),
});

export const commerceStatsSchema = z.object({
  revenue: money,
  subtotal: money,
  tax: money,
  shipping: money,
  orders: count,
  units: count,
  buyers: count,
  visitors: count,
  visits: count,
  convertedVisits: count,
  averageOrderValue: money,
  unitsPerOrder: z.number(),
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
      y: money.describe('Revenue.'),
      count: count.describe('Orders.'),
    }),
  ),
});

export const commerceMetricSchema = z.object({
  name: z.string(),
  revenue: money,
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
  sessionId: z.string(),
  visitId: z.string(),
  createdAt: z.string(),
  subtotal: money,
  shipping: money,
  tax: money,
  total: money,
  lines: count,
  units: count,
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
  cartId: z.string(),
  checkoutId: z.string(),
  orderId: z.string(),
  sessionId: z.string(),
  visitId: z.string(),
  createdAt: z.string(),
  subtotal: money,
  shipping: money,
  tax: money,
  total: money,
  items: z.array(
    z.object({
      index: z.number(),
      productId: z.string(),
      name: z.string(),
      variant: z.string(),
      category: z.string(),
      price: money,
      quantity: count,
      total: money,
    }),
  ),
});

export const commerceProductSchema = z.object({
  productId: z.string(),
  variant: z.string(),
  category: z.string(),
  name: z.string(),
  units: count,
  revenue: money,
  orders: count,
  averagePrice: money,
  views: count,
  additions: count,
  viewingVisits: count,
  addingVisits: count,
  convertedCartVisits: count,
  convertedPurchaseVisits: count,
  addToCartRate: z.number(),
  purchaseRate: z.number(),
  cartToPurchaseRate: z.number(),
  convertedOrderVisits: count,
});

export const commerceProductsResponseSchema = z.object({
  ...pageShape,
  data: z.array(commerceProductSchema),
});

export const commerceBasketsResponseSchema = z.object({
  sizes: z.array(z.object({ size: z.string(), orders: count, revenue: money })),
  pairs: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      pairedProductId: z.string(),
      pairedName: z.string(),
      orders: count,
    }),
  ),
});

export const commerceCheckoutResponseSchema = z.object({
  stages: z.array(
    z.object({
      stage: z.enum(COMMERCE_STAGES),
      sessions: count.describe('Compatibility alias for attempts.'),
      attempts: count.describe('Observed identified attempts; no implied earlier stages.'),
      rate: z.number(),
      stepRate: z.number(),
    }),
  ),
  pendingCarts: count,
  pendingCheckouts: count,
  completedCheckouts: count,
  unlinkedEvents: count,
  unclassifiedEvents: count,
  windowHours: count,
  abandonedCarts: count,
  abandonedCartValue: money,
  abandonedCheckouts: count,
  abandonedCheckoutValue: money,
  orders: count,
  revenue: money,
  medianSecondsToOrder: z.number(),
  medianSecondsCheckoutToOrder: z.number(),
});

export const commerceAbandonedResponseSchema = z.object({
  ...pageShape,
  data: z.array(
    z.object({
      sessionId: z.string(),
      stage: z.enum(['cart', 'checkout']),
      lastAt: z.string(),
      cartId: z.string(),
      checkoutId: z.string(),
      eventName: z.string(),
      lines: count,
      units: count,
      value: money,
      country: z.string(),
      device: z.string(),
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
  revenue: money,
  revenuePerBuyer: money,
  ordersPerBuyer: z.number(),
  newRevenue: money,
  returningRevenue: money,
  medianSecondsToFirstOrder: z.number(),
  medianVisitsToFirstOrder: z.number(),
});

export const commerceBuyersResponseSchema = z.object({
  ...pageShape,
  data: z.array(
    z.object({
      buyerId: z.string(),
      distinctId: z.string(),
      sessionId: z.string(),
      sessions: count,
      orders: count,
      revenue: money,
      firstOrderAt: z.string(),
      lastOrderAt: z.string(),
      isNew: z.boolean(),
    }),
  ),
});

const attributionRows = z.array(z.object({ name: z.string(), revenue: money, orders: count }));

export const commerceAttributionResponseSchema = z.object({
  model: z.enum(COMMERCE_ATTRIBUTION_MODELS),
  lookbackDays: z.number(),
  total: z.object({ revenue: money, orders: count }),
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
  productId?: string;
  category?: string;
  windowHours?: number;
}

/**
 * Commerce parameters from a parsed request. Dates come from the normalized query
 * filters, so website reset dates and account history limits apply.
 */
export function getCommerceRequestParameters(
  query: {
    currency?: string;
    market?: string;
    productId?: string;
    category?: string;
    windowHours?: number;
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
    productId: query.productId || undefined,
    category: query.category || undefined,
    windowHours: query.windowHours,
  };
}
