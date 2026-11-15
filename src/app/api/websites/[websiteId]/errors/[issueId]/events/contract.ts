import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorQuerySchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/{issueId}/events',
    operationId: 'getWebsiteErrorEvents',
    summary: 'List issue occurrences',
    response: errorResponses.events,
    query: errorQuerySchema,
  }),
];
