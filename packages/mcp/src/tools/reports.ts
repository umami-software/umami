import { z } from 'zod';
import { dateRangeInput, parseDateRange, timeUnit, timezone, toReportDates } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

const websiteId = z.string().uuid().describe('Website ID from list_websites.');

function reportFilters(
  range: { startAt: number; endAt: number },
  filters?: z.infer<typeof filtersSchema>,
) {
  return { startAt: range.startAt, endAt: range.endAt, ...toFilterParams(filters) };
}

function isoRange(range: { startAt: number; endAt: number }) {
  return {
    startAt: new Date(range.startAt).toISOString(),
    endAt: new Date(range.endAt).toISOString(),
  };
}

export const runFunnel = defineTool({
  name: 'run_funnel',
  title: 'Run a funnel report',
  description:
    'Calculates how many visitors progressed through an ordered sequence of 2–8 steps (page paths or custom events) ' +
    'within a time window, and where they dropped off. Use this for conversion questions such as ' +
    '"how many visitors who viewed /pricing went on to sign up?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId,
    ...dateRangeInput,
    steps: z
      .array(
        z.object({
          type: z
            .enum(['path', 'event'])
            .describe('"path" for a page path, "event" for a custom event name.'),
          value: z
            .string()
            .min(1)
            .describe(
              'The page path (e.g. "/pricing") or event name (e.g. "signup"). Use * as a wildcard.',
            ),
        }),
      )
      .min(2)
      .max(8)
      .describe('Ordered funnel steps.'),
    windowMinutes: z
      .number()
      .int()
      .positive()
      .max(60 * 24 * 30)
      .optional()
      .describe('Maximum minutes allowed between the first and each following step (default 60).'),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = await client.runFunnelReport({
      websiteId: input.websiteId,
      type: 'funnel',
      filters: reportFilters(range, input.filters),
      parameters: {
        ...toReportDates(range),
        window: input.windowMinutes ?? 60,
        steps: input.steps,
      },
    });

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      windowMinutes: input.windowMinutes ?? 60,
      steps: (Array.isArray(result) ? result : []).map((step, index) => ({
        step: index + 1,
        type: step.type,
        value: step.value,
        visitors: Number(step.visitors ?? 0),
        previous: Number(step.previous ?? 0),
        dropped: Number(step.dropped ?? 0),
        dropoffRate: Number(step.dropoff ?? 0),
        remainingRate: Number(step.remaining ?? 0),
      })),
    };
  },
});

export const runJourney = defineTool({
  name: 'run_journey',
  title: 'Run a journey report',
  description:
    'Returns the most common paths visitors take through a website as sequences of pages/events (up to 7 steps), ' +
    'with the number of visitors following each sequence. Optionally anchor the journey on a start or end step. ' +
    'Use this for "what do visitors do after landing on the homepage?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId,
    ...dateRangeInput,
    steps: z
      .number()
      .int()
      .min(2)
      .max(7)
      .optional()
      .describe('Number of steps per journey (default 3).'),
    startStep: z
      .string()
      .optional()
      .describe('Only journeys starting with this page path or event.'),
    endStep: z.string().optional().describe('Only journeys ending with this page path or event.'),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = await client.runJourneyReport({
      websiteId: input.websiteId,
      type: 'journey',
      filters: reportFilters(range, input.filters),
      parameters: {
        ...toReportDates(range),
        steps: input.steps ?? 3,
        startStep: input.startStep,
        endStep: input.endStep,
      },
    });

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      journeys: (Array.isArray(result) ? result : []).map(row => {
        const record = row as { items?: unknown[]; count?: number; visitors?: number };

        return {
          steps: record.items ?? [],
          visitors: Number(record.count ?? record.visitors ?? 0),
        };
      }),
    };
  },
});

export const runRetention = defineTool({
  name: 'run_retention',
  title: 'Run a retention report',
  description:
    'Returns a cohort retention table: for each day visitors first arrived, the percentage that returned on later days. ' +
    'Use this for "how many visitors come back after their first visit?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId,
    ...dateRangeInput,
    timezone: timezone.optional(),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = await client.runRetentionReport({
      websiteId: input.websiteId,
      type: 'retention',
      filters: reportFilters(range, input.filters),
      parameters: { ...toReportDates(range), timezone: input.timezone },
    });

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      cohorts: (Array.isArray(result) ? result : []).map(row => {
        const record = row as {
          date?: string;
          day?: number;
          visitors?: number;
          returnVisitors?: number;
          percentage?: number;
        };

        return {
          cohortDate: record.date ?? null,
          day: Number(record.day ?? 0),
          visitors: Number(record.visitors ?? 0),
          returningVisitors: Number(record.returnVisitors ?? 0),
          retentionRate: Number(record.percentage ?? 0),
        };
      }),
    };
  },
});

export const runAttribution = defineTool({
  name: 'run_attribution',
  title: 'Run an attribution report',
  description:
    'Attributes conversions (a target page path or custom event) to the referrers, paid ads and UTM sources, mediums, ' +
    'campaigns, content and terms that brought the converting visitors, using first-click or last-click attribution. ' +
    'Use this for "which channels drive signups?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId,
    ...dateRangeInput,
    model: z
      .enum(['first-click', 'last-click'])
      .optional()
      .describe('Attribution model (default last-click).'),
    conversionType: z
      .enum(['path', 'event'])
      .describe('Whether the conversion is a page path or a custom event.'),
    conversion: z
      .string()
      .min(1)
      .describe('The conversion page path (e.g. "/thank-you") or event name (e.g. "signup").'),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = (await client.runAttributionReport({
      websiteId: input.websiteId,
      type: 'attribution',
      filters: reportFilters(range, input.filters),
      parameters: {
        ...toReportDates(range),
        model: input.model ?? 'last-click',
        type: input.conversionType,
        step: input.conversion,
      },
    })) as Record<string, unknown>;

    const list = (value: unknown) =>
      (Array.isArray(value) ? value : []).map(item => {
        const record = item as { name?: string; value?: number };

        return { name: record.name ?? '(none)', value: Number(record.value ?? 0) };
      });

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      model: input.model ?? 'last-click',
      conversion: { type: input.conversionType, value: input.conversion },
      total: result?.total ?? null,
      referrers: list(result?.referrer),
      paidAds: list(result?.paidAds),
      utmSources: list(result?.utm_source),
      utmMediums: list(result?.utm_medium),
      utmCampaigns: list(result?.utm_campaign),
      utmContent: list(result?.utm_content),
      utmTerms: list(result?.utm_term),
    };
  },
});

export const getRevenue = defineTool({
  name: 'get_revenue',
  title: 'Get revenue report',
  description:
    'Returns revenue tracked through Umami revenue events for a time range: totals (sum, count, average, unique ' +
    'customers, ARPU) with a comparison to the previous period, a revenue time series, and breakdowns by country, ' +
    'region, referrer and channel. Requires revenue tracking to be set up and a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId,
    ...dateRangeInput,
    currency: z.string().length(3).optional().describe('ISO 4217 currency code (default USD).'),
    unit: timeUnit.optional(),
    timezone: timezone.optional(),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = (await client.runRevenueReport({
      websiteId: input.websiteId,
      type: 'revenue',
      filters: reportFilters(range, input.filters),
      parameters: {
        ...toReportDates(range),
        currency: (input.currency ?? 'USD').toUpperCase(),
        unit: input.unit,
        timezone: input.timezone,
      },
    })) as Record<string, unknown>;

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      currency: (input.currency ?? 'USD').toUpperCase(),
      total: result?.total ?? null,
      chart: result?.chart ?? [],
      byCountry: result?.country ?? [],
      byRegion: result?.region ?? [],
      byReferrer: result?.referrer ?? [],
      byChannel: result?.channel ?? [],
    };
  },
});
