import { z } from 'zod';
import { dateRangeInput, parseDateRange, timeUnit, timezone } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

interface Point {
  x: string;
  y: number;
}

function series(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return (value as Point[]).map(point => ({ date: point.x, value: Number(point.y ?? 0) }));
}

export const getWebsiteTraffic = defineTool({
  name: 'get_website_traffic',
  title: 'Get website traffic over time',
  description:
    'Returns pageviews and visits (sessions) as a time series bucketed by minute, hour, day, month or year. ' +
    'Use this to chart trends, find peak days, or compare two periods. ' +
    'Each point has an ISO date and a count. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    unit: timeUnit.optional(),
    timezone: timezone.optional(),
    compare: z
      .enum(['prev', 'yoy'])
      .optional()
      .describe('Also return the previous period ("prev") or same period last year ("yoy").'),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = (await client.getWebsitePageviews({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      unit: input.unit,
      timezone: input.timezone,
      compare: input.compare,
      ...toFilterParams(input.filters),
    })) as {
      pageviews?: unknown;
      sessions?: unknown;
      compare?: { pageviews?: unknown; sessions?: unknown; startDate?: string; endDate?: string };
    };

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      unit: input.unit ?? 'auto',
      pageviews: series(result?.pageviews),
      visits: series(result?.sessions),
      ...(result?.compare
        ? {
            previous: {
              startAt: result.compare.startDate ?? null,
              endAt: result.compare.endDate ?? null,
              pageviews: series(result.compare.pageviews),
              visits: series(result.compare.sessions),
            },
          }
        : {}),
    };
  },
});
