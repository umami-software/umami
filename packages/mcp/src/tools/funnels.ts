import { z } from 'zod';
import { toIso } from '../lib/dates';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

interface FunnelRow {
  id?: string;
  name?: string;
  description?: string;
  parameters?: {
    window?: number;
    steps?: { type?: string; value?: string }[];
  } | null;
  createdAt?: string | null;
}

export const listFunnels = defineTool({
  name: 'list_funnels',
  title: 'List saved funnels',
  description:
    "Lists the funnel reports saved for a website, including each funnel's ordered steps and time window. " +
    'When the user refers to a funnel by name ("the checkout funnel"), call this to find its funnelId, then pass ' +
    'that funnelId to run_funnel to get the conversion numbers. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    search: z.string().optional().describe('Filter funnels by name or description.'),
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
    const result = (await client.getWebsiteFunnels({
      websiteId: input.websiteId,
      search: input.search,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    })) as { data?: FunnelRow[]; count?: number; page?: number; pageSize?: number };

    return {
      websiteId: input.websiteId,
      funnels: (result?.data ?? []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || null,
        windowMinutes: row.parameters?.window ?? null,
        steps: (row.parameters?.steps ?? []).map((step, index) => ({
          step: index + 1,
          type: step.type,
          value: step.value,
        })),
        createdAt: toIso(row.createdAt),
      })),
      ...pageInfo(result ?? {}),
    };
  },
});
