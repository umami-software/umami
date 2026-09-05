import { z } from 'zod';
import { filterParams, pagingParams, searchParams, withDateRange } from '@/lib/schema';

/** Shared request/response schemas for the analytics routes under /api/websites/{websiteId}. */

export const analyticsQuerySchema = withDateRange({ ...filterParams }).meta({
  id: 'AnalyticsQuery',
  description:
    'Date range (startAt/endAt in milliseconds or startDate/endDate ISO) plus optional filters. Filter values match exactly unless prefixed with an operator such as `neq.`, `c.` (contains) or `re.`.',
});

export const pagedAnalyticsQuerySchema = withDateRange({
  ...filterParams,
  ...pagingParams,
  ...searchParams,
}).meta({ id: 'PagedAnalyticsQuery' });

export const metricsQuerySchema = withDateRange({
  type: z.string().meta({
    description:
      'Dimension to rank: path, entry, exit, title, query, hostname, referrer, domain, channel, event, tag, browser, os, device, screen, language, country, region, city, distinctId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm.',
  }),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  ...searchParams,
  ...filterParams,
}).meta({ id: 'MetricsQuery' });

export const websiteStatsValuesSchema = z
  .object({
    pageviews: z.number(),
    visitors: z.number(),
    visits: z.number(),
    bounces: z.number(),
    totaltime: z.number(),
  })
  .meta({ id: 'WebsiteStatsValues' });

export const websiteStatsSchema = websiteStatsValuesSchema
  .extend({
    comparison: websiteStatsValuesSchema.meta({
      description: 'The same totals for the comparison period (previous period by default).',
    }),
  })
  .meta({ id: 'WebsiteStats' });

export const timeSeriesPointSchema = z
  .object({
    x: z.string().meta({ description: 'Bucket start (ISO date/time).' }),
    y: z.number().meta({ description: 'Value for the bucket.' }),
  })
  .meta({ id: 'TimeSeriesPoint' });

const pageviewsSeriesSchema = z.object({
  pageviews: z.array(timeSeriesPointSchema),
  sessions: z.array(timeSeriesPointSchema),
});

export const websitePageviewsSchema = pageviewsSeriesSchema
  .extend({
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    compare: pageviewsSeriesSchema
      .extend({
        startDate: z.iso.datetime(),
        endDate: z.iso.datetime(),
      })
      .optional()
      .meta({ description: 'Present when `compare` was requested.' }),
  })
  .meta({ id: 'WebsitePageviews' });

export const metricRowSchema = z
  .object({
    x: z.string().nullable().meta({ description: 'Dimension value (e.g. a path or country).' }),
    y: z.number().meta({ description: 'Count of views/events or unique visitors.' }),
    t: z.string().optional(),
  })
  .meta({ id: 'MetricRow' });

export const metricRowsSchema = z.array(metricRowSchema).meta({ id: 'MetricRows' });

export const activeVisitorsSchema = z
  .object({ visitors: z.number().int().nonnegative() })
  .meta({ id: 'ActiveVisitors' });

export const websiteSessionSchema = z
  .looseObject({
    id: z.uuid(),
    websiteId: z.uuid(),
    hostname: z.string().nullable(),
    browser: z.string().nullable(),
    os: z.string().nullable(),
    device: z.string().nullable(),
    screen: z.string().nullable(),
    language: z.string().nullable(),
    country: z.string().nullable(),
    region: z.string().nullable(),
    city: z.string().nullable(),
    distinctId: z.string().nullable().optional(),
    firstAt: z.iso.datetime(),
    lastAt: z.iso.datetime(),
    visits: z.number(),
    views: z.number(),
    events: z.number().optional(),
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'WebsiteSession' });

export const websiteSessionPageSchema = z
  .object({
    data: z.array(websiteSessionSchema),
    count: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().nonnegative(),
    isCapped: z.boolean().optional(),
  })
  .meta({ id: 'WebsiteSessionPage' });

export const websiteEventSchema = z
  .looseObject({
    id: z.uuid(),
    websiteId: z.uuid(),
    sessionId: z.uuid(),
    createdAt: z.iso.datetime(),
    hostname: z.string().nullable().optional(),
    urlPath: z.string().nullable().optional(),
    urlQuery: z.string().nullable().optional(),
    referrerDomain: z.string().nullable().optional(),
    pageTitle: z.string().nullable().optional(),
    eventType: z.number().int(),
    eventName: z.string().nullable().optional(),
    distinctId: z.string().nullable().optional(),
  })
  .meta({ id: 'WebsiteEvent' });

export const websiteEventPageSchema = z
  .object({
    data: z.array(websiteEventSchema),
    count: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().nonnegative(),
    isCapped: z.boolean().optional(),
  })
  .meta({ id: 'WebsiteEventPage' });
