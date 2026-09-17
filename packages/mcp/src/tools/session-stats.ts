import { z } from 'zod';
import { dateRangeInput, parseDateRange } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { defineTool } from '../lib/tool';

type StatValue = { value?: number } | number | undefined;

function unwrap(value: StatValue) {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value?.value ?? 0);
}

export const getSessionStats = defineTool({
  name: 'get_session_stats',
  title: 'Get session stats',
  description:
    'Returns session-level totals for a website over a time range: unique visitors, visits (sessions), pageviews, ' +
    'custom events and the number of distinct countries visitors came from. ' +
    'Lighter than get_sessions when you only need counts, and works with filters (e.g. sessions from Chrome users in the US). ' +
    'For bounce rate and visit duration use get_website_stats. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const result = (await client.getWebsiteSessionStats({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      ...toFilterParams(input.filters),
    })) as Record<string, StatValue>;

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      visitors: unwrap(result?.visitors),
      visits: unwrap(result?.visits),
      pageviews: unwrap(result?.pageviews),
      events: unwrap(result?.events),
      countries: unwrap(result?.countries),
    };
  },
});
