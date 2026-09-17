import { z } from 'zod';
import { defineTool } from '../lib/tool';

export const getRealtime = defineTool({
  name: 'get_realtime',
  title: 'Get current active visitors',
  description:
    'Returns the number of visitors currently active on a website (active within the last few minutes). ' +
    'Use this for "how many people are on the site right now?". Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
  }),
  annotations: { idempotentHint: false },
  async handler(input, { client }) {
    const result = await client.getWebsiteActive({ websiteId: input.websiteId });

    return {
      websiteId: input.websiteId,
      activeVisitors: Number(result?.visitors ?? 0),
      asOf: new Date().toISOString(),
    };
  },
});
