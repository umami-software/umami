import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorQuerySchema, errorUpdateSchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/{issueId}',
    operationId: 'getWebsiteErrorIssue',
    summary: 'Get an error issue',
    response: errorResponses.issue,
    query: errorQuerySchema,
  }),
  errorOperation({
    method: 'patch',
    path: '/api/websites/{websiteId}/errors/{issueId}',
    operationId: 'updateWebsiteErrorIssue',
    summary: 'Change error issue status',
    body: errorUpdateSchema,
    response: errorResponses.ok,
  }),
];
