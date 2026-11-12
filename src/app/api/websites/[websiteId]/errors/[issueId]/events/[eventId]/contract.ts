import { errorOperation, errorResponses } from '@/lib/errors/contracts';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/{issueId}/events/{eventId}',
    operationId: 'getWebsiteErrorEvent',
    summary: 'Get an error occurrence',
    response: errorResponses.event,
  }),
];
