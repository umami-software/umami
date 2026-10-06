import { z } from 'zod';
import { toIso } from '../lib/dates';
import { defineTool } from '../lib/tool';

interface SegmentRow {
  id?: string;
  name?: string;
  type?: string;
  parameters?: unknown;
  createdAt?: string | null;
}

export const listSegments = defineTool({
  name: 'list_segments',
  title: 'List saved segments and cohorts',
  description:
    'Lists the saved segments (filter presets such as "mobile visitors from the US") and cohorts (groups of visitors who ' +
    'performed an action) defined for a website, with their IDs and definitions. Pass the ID as filters.segment or ' +
    'filters.cohort in other tools to scope results to that audience. Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
    type: z
      .enum(['segment', 'cohort'])
      .optional()
      .describe('Which kind to list. Defaults to both.'),
    search: z.string().optional().describe('Filter by name.'),
  }),
  async handler(input, { client }) {
    const types = input.type ? [input.type] : (['segment', 'cohort'] as const);
    const results = await Promise.all(
      types.map(async type => {
        const result = (await client.getWebsiteSegments({
          websiteId: input.websiteId,
          type,
          search: input.search,
        })) as { data?: SegmentRow[] };

        return (result?.data ?? []).map(row => ({
          id: row.id,
          name: row.name,
          type: row.type ?? type,
          definition: row.parameters ?? null,
          createdAt: toIso(row.createdAt),
        }));
      }),
    );

    return {
      websiteId: input.websiteId,
      segments: results.flat(),
    };
  },
});
