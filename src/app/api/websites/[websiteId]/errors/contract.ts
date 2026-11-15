import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorQuerySchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors',
    operationId: 'getWebsiteErrors',
    summary: 'List website error issues',
    response: errorResponses.issues,
    query: errorQuerySchema,
  }),
];
