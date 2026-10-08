import type { UmamiClient } from '@umami/api-client';
import { z } from 'zod';
import { dateRangeInput, parseDateRange, timeUnit, timezone } from '../lib/dates';
import { McpToolError } from '../lib/errors';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

const websiteId = z.string().uuid().describe('Website ID from list_websites.');

type Params = Record<string, unknown>;
type Call = (input: Params) => Promise<any>;

/**
 * Commerce operations of the Umami API client. Called through this accessor so the tools
 * fail with a clear message, rather than a TypeError, against an API client release that
 * predates commerce reports.
 */
interface CommerceClient {
  getWebsiteCommerceCurrencies: Call;
  getWebsiteCommerceStats: Call;
  getWebsiteCommerceChart: Call;
  getWebsiteCommerceMetrics: Call;
  getWebsiteCommerceCustomers: Call;
  getWebsiteCommerceAttribution: Call;
}

function commerce(client: UmamiClient): CommerceClient {
  const candidate = client as unknown as Partial<CommerceClient>;

  if (typeof candidate.getWebsiteCommerceStats !== 'function') {
    throw new McpToolError(
      'api_error',
      'This Umami API client does not support commerce reports. Upgrade @umami/api-client.',
    );
  }

  return candidate as CommerceClient;
}

function isoRange(range: { startAt: number; endAt: number }) {
  return {
    startAt: new Date(range.startAt).toISOString(),
    endAt: new Date(range.endAt).toISOString(),
  };
}

const commerceInput = {
  websiteId,
  ...dateRangeInput,
  currency: z
    .string()
    .length(3)
    .optional()
    .describe(
      'ISO 4217 currency code. Defaults to the currency with the most orders in the range. Amounts are never summed across currencies.',
    ),
  market: z.string().min(1).optional().describe('Only orders placed in this market, e.g. "DE".'),
  filters: filtersSchema.optional(),
};

/** Resolves the requested currency, or the one with the most completed orders in the range. */
async function resolveCurrency(
  api: CommerceClient,
  params: Params,
  currency?: string,
): Promise<{
  currency: string | null;
  currencies: { currency: string; orders: number; revenue: number }[];
}> {
  const currencies = (await api.getWebsiteCommerceCurrencies(params)) ?? [];

  return {
    currency: currency?.toUpperCase() ?? currencies[0]?.currency ?? null,
    currencies,
  };
}

export const getCommerce = defineTool({
  name: 'get_commerce',
  title: 'Get commerce report',
  description:
    'Returns e-commerce results from completed orders (commerce events with an orderId) for a time range and one ' +
    'currency: revenue, orders, average order value, buyers, conversion rate and revenue per visitor with a ' +
    'comparison to the previous period; a revenue time series; revenue by channel, country and market; ' +
    'refunds and net revenue; new vs returning buyers; and last-click ' +
    'revenue attribution. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    ...commerceInput,
    unit: timeUnit.optional(),
    timezone: timezone.optional(),
  }),
  async handler(input, { client }) {
    const api = commerce(client);
    const range = parseDateRange(input);
    const base = {
      websiteId: input.websiteId,
      ...range,
      ...toFilterParams(input.filters),
      unit: input.unit,
      timezone: input.timezone,
    };
    const { currency, currencies } = await resolveCurrency(api, base, input.currency);

    if (!currency) {
      return {
        websiteId: input.websiteId,
        range: isoRange(range),
        currency: null,
        currencies: [],
        message: 'No completed orders were recorded in this range.',
      };
    }

    const params = { ...base, currency, market: input.market };
    const [stats, chart, byChannel, byCountry, byMarket, customers, attribution] =
      await Promise.all([
        api.getWebsiteCommerceStats(params),
        api.getWebsiteCommerceChart(params),
        api.getWebsiteCommerceMetrics({ ...params, type: 'channel', limit: 20 }),
        api.getWebsiteCommerceMetrics({ ...params, type: 'country', limit: 20 }),
        api.getWebsiteCommerceMetrics({ ...params, type: 'market', limit: 20 }),

        api.getWebsiteCommerceCustomers(params),
        api.getWebsiteCommerceAttribution({ ...params, model: 'last-click' }),
      ]);

    return {
      websiteId: input.websiteId,
      range: isoRange(range),
      currency,
      market: input.market ?? null,
      currencies,
      total: stats ?? null,
      chart: chart?.chart ?? [],
      byChannel: byChannel ?? [],
      byCountry: byCountry ?? [],
      byMarket: byMarket ?? [],
      customers: customers ?? null,
      attribution: attribution
        ? {
            model: attribution.model,
            lookbackDays: attribution.lookbackDays,
            channel: attribution.channel,
            referrer: attribution.referrer,
            utmSource: attribution.utmSource,
            utmCampaign: attribution.utmCampaign,
          }
        : null,
    };
  },
});
