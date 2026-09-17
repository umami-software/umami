import { z } from 'zod';
import { toIso } from '../lib/dates';
import { clamp, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, pageInfo } from '../lib/limits';
import { defineTool } from '../lib/tool';

export const listWebsites = defineTool({
  name: 'list_websites',
  title: 'List websites',
  description:
    'Lists the websites the authenticated user can access, including websites shared through teams. ' +
    'Returns each website ID, name and domain. Call this first to find the websiteId required by every other tool. ' +
    'Results are paginated.',
  inputSchema: z.object({
    search: z.string().optional().describe('Filter websites by name or domain.'),
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
    const result = await client.listWebsites({
      search: input.search,
      page: input.page ?? 1,
      pageSize: clamp(input.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
      includeTeams: 'true',
    });

    return {
      websites: result.data.map(website => ({
        id: website.id,
        name: website.name,
        domain: website.domain,
        teamId: website.teamId ?? null,
        createdAt: toIso(website.createdAt),
      })),
      ...pageInfo(result),
    };
  },
});
