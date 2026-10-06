import { z } from 'zod';
import { dateRangeInput, parseDateRange, timeUnit, timezone } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { clamp, DEFAULT_METRIC_LIMIT, MAX_METRIC_LIMIT } from '../lib/limits';
import { defineTool } from '../lib/tool';

interface EventTotals {
  events?: number;
  visitors?: number;
  visits?: number;
  uniqueEvents?: number;
}

function totals(row: EventTotals | undefined) {
  return {
    events: Number(row?.events ?? 0),
    visitors: Number(row?.visitors ?? 0),
    visits: Number(row?.visits ?? 0),
    uniqueEvents: Number(row?.uniqueEvents ?? 0),
  };
}

export const getEventStats = defineTool({
  name: 'get_event_stats',
  title: 'Get custom event stats',
  description:
    'Returns totals for custom events (not pageviews) over a time range: number of events fired, unique visitors and ' +
    'visits that triggered them, and how many distinct event names were seen. Also returns the previous period ' +
    '(or same period last year) for comparison. Use "event" in filters to scope to one event name. ' +
    'For a per-event ranking use get_website_metrics with type "event"; for trends over time use get_event_series. ' +
    'Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
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
    const result = (await client.getWebsiteEventStats({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      compare: input.compare,
      ...toFilterParams(input.filters),
    })) as { data?: EventTotals & { comparison?: EventTotals } };

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      current: totals(result?.data),
      previous: totals(result?.data?.comparison),
      compare: input.compare ?? 'prev',
    };
  },
});

interface SeriesRow {
  x: string;
  t: string;
  y: number;
}

export const getEventSeries = defineTool({
  name: 'get_event_series',
  title: 'Get custom events over time',
  description:
    'Returns a time series of custom event counts, grouped by event name and bucketed by hour, day, month or year. ' +
    'Use this to see how often each event fires over time, spot spikes, or compare events against each other. ' +
    'Only the top N event names by volume are included (default 20). Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    unit: timeUnit.optional(),
    timezone: timezone.optional(),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_METRIC_LIMIT)
      .optional()
      .describe(
        `Maximum number of event names to include (default ${DEFAULT_METRIC_LIMIT}, max ${MAX_METRIC_LIMIT}).`,
      ),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const rows = (await client.getWebsiteEventSeries({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      unit: input.unit,
      timezone: input.timezone ?? 'UTC',
      limit: clamp(input.limit, DEFAULT_METRIC_LIMIT, MAX_METRIC_LIMIT),
      ...toFilterParams(input.filters),
    })) as SeriesRow[];

    const byName = new Map<string, { date: string; value: number }[]>();

    for (const row of Array.isArray(rows) ? rows : []) {
      const name = row.x ?? '';
      const points = byName.get(name) ?? [];

      points.push({ date: row.t, value: Number(row.y ?? 0) });
      byName.set(name, points);
    }

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      unit: input.unit ?? 'day',
      events: [...byName.entries()].map(([name, series]) => ({
        name,
        total: series.reduce((sum, point) => sum + point.value, 0),
        series,
      })),
    };
  },
});
