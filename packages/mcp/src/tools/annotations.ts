import { z } from 'zod';
import { isoTimestamp, parseDateRange, toIso } from '../lib/dates';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

interface AnnotationRow {
  id?: string;
  date?: string | null;
  allDay?: boolean;
  note?: string;
  createdAt?: string | null;
}

export const getAnnotations = defineTool({
  name: 'get_annotations',
  title: 'Get annotations',
  description:
    'Lists the dated notes a team has added to a website\'s timeline, such as "launched v2", "ran newsletter campaign" ' +
    'or "outage". Use these to explain spikes or dips you see in get_website_traffic. Optionally restrict to a date ' +
    'range or search the note text. Results are paginated. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    startAt: isoTimestamp.optional().describe('Only annotations on or after this date.'),
    endAt: isoTimestamp
      .optional()
      .describe('Only annotations on or before this date. Defaults to now when startAt is set.'),
    search: z.string().optional().describe('Free-text search of the note.'),
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
    const range = input.startAt
      ? parseDateRange({ startAt: input.startAt, endAt: input.endAt })
      : null;
    const result = (await client.getWebsiteAnnotations({
      websiteId: input.websiteId,
      ...(range ? { startAt: range.startAt, endAt: range.endAt } : {}),
      search: input.search,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    })) as { data?: AnnotationRow[]; count?: number; page?: number; pageSize?: number };

    return {
      websiteId: input.websiteId,
      ...(range
        ? {
            range: {
              startAt: new Date(range.startAt).toISOString(),
              endAt: new Date(range.endAt).toISOString(),
            },
          }
        : {}),
      annotations: (result?.data ?? []).map(row => ({
        id: row.id,
        date: toIso(row.date),
        allDay: row.allDay ?? true,
        note: row.note ?? '',
        createdAt: toIso(row.createdAt),
      })),
      ...pageInfo(result ?? {}),
    };
  },
});
