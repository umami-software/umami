import { errorOperation, errorResponses } from '@/lib/errors/contracts';
import { errorSettingsSchema } from '@/lib/errors/schema';

export const operations = [
  errorOperation({
    path: '/api/websites/{websiteId}/errors/settings',
    operationId: 'getWebsiteErrorSettings',
    summary: 'Get error tracking settings',
    response: errorResponses.settings,
  }),
  errorOperation({
    method: 'put',
    path: '/api/websites/{websiteId}/errors/settings',
    operationId: 'updateWebsiteErrorSettings',
    summary: 'Configure error tracking',
    body: errorSettingsSchema,
    response: errorResponses.ok,
  }),
];
