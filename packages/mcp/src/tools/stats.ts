import { z } from 'zod';
import { dateRangeInput, parseDateRange, timezone } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

interface StatsRow {
  pageviews?: number;
  visitors?: number;
  visits?: number;
  bounces?: number;
  totaltime?: number;
}

function firstRow(value: unknown): StatsRow {
  if (Array.isArray(value)) {
    return (value[0] ?? {}) as StatsRow;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if ('pageviews' in record) {
      return record as StatsRow;
    }

    if (record['0'] && typeof record['0'] === 'object') {
      return record['0'] as StatsRow;
    }
  }

  return {};
}

function summarize(row: StatsRow) {
  const pageviews = Number(row.pageviews ?? 0);
  const visitors = Number(row.visitors ?? 0);
  const visits = Number(row.visits ?? 0);
  const bounces = Number(row.bounces ?? 0);
  const totaltime = Number(row.totaltime ?? 0);

  return {
    pageviews,
    visitors,
    visits,
    bounces,
    bounceRate: visits ? Math.round((Math.min(bounces, visits) / visits) * 1000) / 10 : 0,
    averageVisitDurationSeconds: visits ? Math.round(totaltime / visits) : 0,
    viewsPerVisit: visits ? Math.round((pageviews / visits) * 100) / 100 : 0,
  };
}

export const getWebsiteStats = defineTool({
  name: 'get_website_stats',
  title: 'Get website stats',
  description:
    'Returns summary traffic totals for a website over a time range: pageviews, unique visitors, visits (sessions), ' +
    'bounces, bounce rate, average visit duration and views per visit. Also returns the same totals for the ' +
    'previous period of equal length (or the same period last year) so you can compare. ' +
    'Use this for questions like "how much traffic did we get last week?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    timezone: timezone.optional(),
    compare: z
      .enum(['prev', 'yoy'])
      .optional()
      .describe(
        'Comparison period: "prev" (previous period, default) or "yoy" (same period last year).',
      ),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = await client.getWebsiteStats({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      timezone: input.timezone,
      compare: input.compare,
      ...toFilterParams(input.filters),
    });
    const current = firstRow(result);
    const comparison = firstRow((result as { comparison?: unknown })?.comparison);

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      current: summarize(current),
      previous: summarize(comparison),
      compare: input.compare ?? 'prev',
    };
  },
});
