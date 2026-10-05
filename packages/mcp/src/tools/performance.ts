import { z } from 'zod';
import { dateRangeInput, parseDateRange, timeUnit, timezone } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { clamp, DEFAULT_METRIC_LIMIT, MAX_METRIC_LIMIT } from '../lib/limits';
import { defineTool } from '../lib/tool';

const METRICS = ['lcp', 'inp', 'cls', 'fcp', 'ttfb'] as const;

const metricInput = z
  .enum(METRICS)
  .describe(
    'Web vital: "lcp" Largest Contentful Paint (ms), "inp" Interaction to Next Paint (ms), "cls" Cumulative Layout Shift (unitless score), "fcp" First Contentful Paint (ms), "ttfb" Time to First Byte (ms).',
  );

interface Percentiles {
  p50?: number;
  p75?: number;
  p95?: number;
}

interface Summary extends Partial<Record<(typeof METRICS)[number], Percentiles>> {
  count?: number;
}

interface ChartRow extends Percentiles {
  t: string;
}

interface MetricRow extends Percentiles {
  name?: string;
  count?: number;
}

function percentiles(value: Percentiles | undefined) {
  return {
    p50: Number(value?.p50 ?? 0),
    p75: Number(value?.p75 ?? 0),
    p95: Number(value?.p95 ?? 0),
  };
}

export const getPerformance = defineTool({
  name: 'get_performance',
  title: 'Get web vitals performance',
  description:
    'Returns Core Web Vitals collected from real visitors over a time range: p50/p75/p95 for LCP, INP, CLS, FCP and TTFB ' +
    'plus the number of measurements. Google treats p75 as the score to judge by (good LCP ≤ 2500ms, INP ≤ 200ms, CLS ≤ 0.1). ' +
    'Set "metric" to also get that metric as a time series, and "breakdown" to rank pages, devices or browsers by that metric ' +
    'to find what is slow. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    metric: metricInput
      .optional()
      .describe(
        'Metric for the time series and breakdown. Defaults to "lcp" when breakdown is set.',
      ),
    breakdown: z
      .enum(['path', 'title', 'device', 'browser'])
      .optional()
      .describe('Rank this dimension by the chosen metric (slowest first by p75).'),
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_METRIC_LIMIT)
      .optional()
      .describe(
        `Rows in the breakdown (default ${DEFAULT_METRIC_LIMIT}, max ${MAX_METRIC_LIMIT}).`,
      ),
    unit: timeUnit.optional(),
    timezone: timezone.optional(),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const common = {
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      timezone: input.timezone ?? 'UTC',
      unit: input.unit ?? 'day',
      ...toFilterParams(input.filters),
    };
    const metric = input.metric ?? (input.breakdown ? 'lcp' : undefined);

    const [summary, chart, breakdown] = await Promise.all([
      client.getWebsitePerformanceStats(common) as Promise<Summary>,
      metric
        ? (client.getWebsitePerformanceChart({ ...common, metric }) as Promise<{
            chart?: ChartRow[];
          }>)
        : Promise.resolve(null),
      input.breakdown
        ? (client.getWebsitePerformanceMetrics({
            ...common,
            metric,
            type: input.breakdown,
            limit: clamp(input.limit, DEFAULT_METRIC_LIMIT, MAX_METRIC_LIMIT),
          }) as Promise<MetricRow[]>)
        : Promise.resolve(null),
    ]);

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      measurements: Number(summary?.count ?? 0),
      vitals: Object.fromEntries(METRICS.map(name => [name, percentiles(summary?.[name])])),
      ...(metric && chart
        ? {
            series: {
              metric,
              unit: input.unit ?? 'day',
              points: (chart.chart ?? []).map(row => ({ date: row.t, ...percentiles(row) })),
            },
          }
        : {}),
      ...(input.breakdown && breakdown
        ? {
            breakdown: {
              metric,
              type: input.breakdown,
              rows: (Array.isArray(breakdown) ? breakdown : []).map(row => ({
                name: row.name ?? '',
                measurements: Number(row.count ?? 0),
                ...percentiles(row),
              })),
            },
          }
        : {}),
    };
  },
});
