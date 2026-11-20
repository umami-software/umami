import { z } from 'zod';
import { dateRangeInput, parseDateRange, toIso } from '../lib/dates';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

const MAX_STACK_LENGTH = 8000;
const RECENT_OCCURRENCES = 10;

const filterInput = {
  websiteId: z.string().uuid().describe('Website ID from list_websites.'),
  ...dateRangeInput,
  status: z
    .enum(['unresolved', 'resolved', 'ignored'])
    .optional()
    .describe('Only issues with this status.'),
  search: z.string().max(200).optional().describe('Free-text search of the error title.'),
  release: z.string().max(100).optional().describe('Only errors from this release.'),
  environment: z.string().max(50).optional().describe('Only errors from this environment.'),
  browser: z.string().max(50).optional().describe('Only errors from this browser.'),
  urlPath: z.string().max(500).optional().describe('Only errors on this page path.'),
};

function buildQuery(input: z.infer<z.ZodObject<typeof filterInput>>) {
  const range = parseDateRange({ startAt: input.startAt, endAt: input.endAt });

  return {
    range: {
      startAt: new Date(range.startAt).toISOString(),
      endAt: new Date(range.endAt).toISOString(),
    },
    query: {
      startAt: range.startAt,
      endAt: range.endAt,
      status: input.status,
      search: input.search,
      release: input.release,
      environment: input.environment,
      browser: input.browser,
      urlPath: input.urlPath,
    },
  };
}

interface Totals {
  occurrences?: number;
  visits?: number;
  issues?: number;
  firstSeen?: string | null;
  lastSeen?: string | null;
  series?: { date: string; occurrences: number }[];
}

function mapTotals(row: Totals) {
  return {
    occurrences: row.occurrences ?? 0,
    visits: row.visits ?? 0,
    firstSeen: toIso(row.firstSeen),
    lastSeen: toIso(row.lastSeen),
  };
}

interface IssueRow extends Totals {
  id?: string;
  title?: string;
  status?: string;
  resolvedAt?: string | null;
}

function mapIssue(row: IssueRow) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    resolvedAt: toIso(row.resolvedAt),
    ...mapTotals(row),
  };
}

interface EventRow {
  id?: string;
  createdAt?: string | null;
  message?: string;
  handled?: boolean;
  release?: string;
  environment?: string;
  browser?: string;
  urlPath?: string;
  sessionId?: string;
  stack?: string;
  tags?: Record<string, string>;
}

export const getErrors = defineTool({
  name: 'get_errors',
  title: 'Get error issues',
  description:
    'Lists the JavaScript error issues Umami has grouped for a website, with status (unresolved, resolved or ' +
    'ignored), occurrence and affected-visit counts, and first/last seen. Use it to find what is failing and ' +
    'how often, then get_error_issue for details. Filter by status, release, environment, browser or page ' +
    'path. Results are paginated. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    ...filterInput,
    page: z.number().int().positive().optional().describe('Page number, starting at 1.'),
    pageSize: z
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .optional()
      .describe(`Results per page (default ${DEFAULT_PAGE_SIZE}, max ${MAX_PAGE_SIZE}).`),
  }),
  async handler(input, { client }) {
    const { range, query } = buildQuery(input);
    const result = (await client.getWebsiteErrors({
      websiteId: input.websiteId,
      ...query,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    })) as { data?: IssueRow[]; count?: number; page?: number; pageSize?: number };

    return {
      websiteId: input.websiteId,
      range,
      issues: (result?.data ?? []).map(mapIssue),
      ...pageInfo(result ?? {}),
    };
  },
});

export const getErrorIssue = defineTool({
  name: 'get_error_issue',
  title: 'Get error issue',
  description:
    'Returns one error issue with its status, totals, daily trend and most recent occurrences. Pass eventId ' +
    '(from a previous call) to get a single occurrence with its stack trace and tags instead. ' +
    'Requires a websiteId from list_websites and an issueId from get_errors.',
  inputSchema: z.object({
    ...filterInput,
    issueId: z.string().uuid().describe('Issue ID from get_errors.'),
    eventId: z.string().uuid().optional().describe('Occurrence ID; returns its stack trace.'),
  }),
  async handler(input, { client }) {
    const { range, query } = buildQuery(input);
    const ids = { websiteId: input.websiteId, issueId: input.issueId };

    if (input.eventId) {
      const event = (await client.getWebsiteErrorEvent({
        ...ids,
        eventId: input.eventId,
      })) as EventRow;

      return {
        ...ids,
        event: {
          ...event,
          createdAt: toIso(event?.createdAt),
          stack: event?.stack?.slice(0, MAX_STACK_LENGTH),
        },
      };
    }

    const [issue, events] = (await Promise.all([
      client.getWebsiteErrorIssue({ ...ids, ...query, page: 1, pageSize: 1 }),
      client.getWebsiteErrorEvents({ ...ids, ...query, page: 1, pageSize: RECENT_OCCURRENCES }),
    ])) as [IssueRow, { data?: EventRow[] }];

    return {
      ...ids,
      range,
      issue: mapIssue(issue ?? {}),
      series: issue?.series ?? [],
      recentOccurrences: (events?.data ?? []).map(row => ({
        ...row,
        createdAt: toIso(row.createdAt),
      })),
    };
  },
});

export const getErrorStats = defineTool({
  name: 'get_error_stats',
  title: 'Get error stats',
  description:
    'Returns total error occurrences, distinct issues and affected visits for a date range, with a daily trend. ' +
    'Use it to see whether errors are rising, or compare releases and environments via the filters. ' +
    'Requires a websiteId from list_websites.',
  inputSchema: z.object(filterInput),
  async handler(input, { client }) {
    const { range, query } = buildQuery(input);
    const result = (await client.getWebsiteErrorStats({
      websiteId: input.websiteId,
      ...query,
    })) as Totals;

    return {
      websiteId: input.websiteId,
      range,
      ...mapTotals(result ?? {}),
      issues: result?.issues ?? 0,
      series: result?.series ?? [],
    };
  },
});
