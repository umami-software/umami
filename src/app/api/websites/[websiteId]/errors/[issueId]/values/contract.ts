import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorValuesQuerySchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/{issueId}/values',
    operationId: 'getWebsiteErrorIssueValues',
    summary: 'List distinct values of an error filter field for one issue',
    response: errorResponses.values,
    query: errorValuesQuerySchema,
  }),
];
