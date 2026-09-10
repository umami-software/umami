import { z } from 'zod';
import { toIso } from '../lib/dates';
import { defineTool } from '../lib/tool';

export const getWebsiteDateRange = defineTool({
  name: 'get_website_daterange',
  title: 'Get website data date range',
  description:
    'Returns the earliest and latest timestamps for which a website has recorded data. ' +
    'Call this before querying an unfamiliar site or a period far in the past so you do not ask for dates ' +
    'outside the available data (which returns zeros). Requires a websiteId from list_websites.',
  inputSchema: z.object({
    websiteId: z.string().uuid().describe('Website ID from list_websites.'),
  }),
  async handler(input, { client }) {
    const result = (await client.getWebsiteDateRange({ websiteId: input.websiteId })) as {
      startDate?: string | null;
      endDate?: string | null;
    };

    return {
      websiteId: input.websiteId,
      startAt: toIso(result?.startDate),
      endAt: toIso(result?.endDate),
      hasData: Boolean(result?.startDate && result?.endDate),
    };
  },
});
