import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorValuesQuerySchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/values',
    operationId: 'getWebsiteErrorValues',
    summary: 'List distinct values of an error filter field',
    response: errorResponses.values,
    query: errorValuesQuerySchema,
  }),
];
