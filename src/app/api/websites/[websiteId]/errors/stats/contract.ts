import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorQuerySchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/stats',
    operationId: 'getWebsiteErrorStats',
    summary: 'Get website error totals and trend',
    response: errorResponses.stats,
    query: errorQuerySchema,
  }),
];
