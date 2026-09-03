import { z } from 'zod';
import { dateRangeInput, parseDateRange, toIso } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

interface EventRow {
  id?: string;
  sessionId?: string;
  createdAt?: string | Date;
  eventName?: string | null;
  eventType?: number;
  urlPath?: string;
  hostname?: string;
  referrerDomain?: string | null;
  pageTitle?: string | null;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  distinctId?: string | null;
  [key: string]: unknown;
}

export const getEvents = defineTool({
  name: 'get_events',
  title: 'Get tracked events',
  description:
    'Lists individual tracked events (pageviews and custom events) for a website during a time range, newest first. ' +
    'Each event includes its name, page path, session ID, timestamp and visitor attributes. ' +
    'Set "event" to only return a specific custom event name, or "search" for a free-text match. ' +
    'To count events by name instead, use get_website_metrics with type "event". Results are paginated. ' +
    'Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    event: z.string().optional().describe('Custom event name to filter on, e.g. "signup".'),
    search: z.string().optional().describe('Free-text search across event names and URLs.'),
    page: z.number().int().positive().optional().describe('Page number, starting at 1.'),
    pageSize: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .optional()
      .describe(`Results per page (default ${DEFAULT_PAGE_SIZE}, max ${MAX_PAGE_SIZE}).`),
    filters: filtersSchema.optional(),
  }),
  async handler(input, { client }) {
    const range = parseDateRange(input);
    const filters = toFilterParams(input.filters);

    if (input.event) {
      filters.event = input.event;
    }

    const result = (await client.getWebsiteEvents({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      search: input.search,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
      ...filters,
    })) as { data?: EventRow[]; count?: number; page?: number; pageSize?: number };

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      events: (result?.data ?? []).map(row => ({
        id: row.id,
        sessionId: row.sessionId,
        createdAt: toIso(row.createdAt as string),
        type: row.eventType === 2 ? 'event' : row.eventType === 1 ? 'pageview' : row.eventType,
        name: row.eventName ?? null,
        path: row.urlPath,
        title: row.pageTitle ?? null,
        hostname: row.hostname,
        referrer: row.referrerDomain ?? null,
        browser: row.browser,
        os: row.os,
        device: row.device,
        country: row.country,
        distinctId: row.distinctId ?? null,
      })),
      ...pageInfo(result ?? {}),
    };
  },
});
