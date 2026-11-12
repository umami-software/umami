import { z } from 'zod';
import { dateRangeInput, parseDateRange, toIso } from '../lib/dates';
import { filtersSchema, toFilterParams } from '../lib/filters';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

export interface SessionRow {
  id: string;
  websiteId?: string;
  hostname?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  language?: string;
  country?: string;
  region?: string;
  city?: string;
  distinctId?: string | null;
  firstAt?: string | Date;
  lastAt?: string | Date;
  visits?: number;
  views?: number;
  events?: number;
  createdAt?: string | Date;
  [key: string]: unknown;
}

export function formatSession(row: SessionRow) {
  return {
    id: row.id,
    firstAt: toIso(row.firstAt as string),
    lastAt: toIso(row.lastAt as string),
    visits: Number(row.visits ?? 0),
    views: Number(row.views ?? 0),
    events: Number(row.events ?? 0),
    hostname: row.hostname ?? null,
    browser: row.browser ?? null,
    os: row.os ?? null,
    device: row.device ?? null,
    screen: row.screen ?? null,
    language: row.language ?? null,
    country: row.country ?? null,
    region: row.region ?? null,
    city: row.city ?? null,
    distinctId: row.distinctId ?? null,
  };
}

export const getSessions = defineTool({
  name: 'get_sessions',
  title: 'Get visitor sessions',
  description:
    "Lists visitor sessions for a website during a time range, newest first. Each session includes the visitor's " +
    'browser, OS, device, location, identified user ID (distinctId), number of visits, views and events, and first/last ' +
    'activity timestamps. Use "search" to find sessions by distinct ID, city, browser, OS or device. ' +
    'Use get_session for full details of one session. Results are paginated. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    ...dateRangeInput,
    search: z
      .string()
      .optional()
      .describe('Free-text search (distinct ID, city, browser, OS, device).'),
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
    const result = (await client.getWebsiteSessions({
      websiteId: input.websiteId,
      startAt: range.startAt,
      endAt: range.endAt,
      search: input.search,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
      ...toFilterParams(input.filters),
    })) as { data?: SessionRow[]; count?: number; page?: number; pageSize?: number };

    return {
      websiteId: input.websiteId,
      range: {
        startAt: new Date(range.startAt).toISOString(),
        endAt: new Date(range.endAt).toISOString(),
      },
      sessions: (result?.data ?? []).map(formatSession),
      ...pageInfo(result ?? {}),
    };
  },
});
