import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import { websiteDataRangeSchema } from '../../request-schema';
import { websiteIdPathSchema } from '../../response-schema';

const websiteDataCountsSchema = z
  .object({
    events: z.number().int().describe('Number of events (including pageviews).'),
    eventData: z.number().int().describe('Number of event data rows.'),
    sessions: z.number().int().describe('Number of sessions.'),
    revenue: z.number().int().describe('Number of revenue rows.'),
    replays: z.number().int().describe('Number of session replays left with no recording.'),
    heatmaps: z.number().int().describe('Number of heatmap events.'),
  })
  .meta({ id: 'WebsiteDataCounts' });

const getWebsiteClearPreviewOperation = defineOperation({
  method: 'get',
  path: '/api/websites/{websiteId}/clear',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'getWebsiteClearPreview',
    summary: 'Preview website data deletion for a date range',
    description:
      'Counts the rows that deleting the website data in the half-open range [startAt, endAt) would remove. Requires relational storage.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
      query: websiteDataRangeSchema,
    },
    responses: {
      '200': jsonResponse(websiteDataCountsSchema, 'Counts of the rows in the range.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

const clearWebsiteDataOperation = defineOperation({
  method: 'post',
  path: '/api/websites/{websiteId}/clear',
  audience: 'public',
  auth: 'bearer',
  operation: {
    operationId: 'clearWebsiteData',
    summary: 'Delete website data for a date range',
    description:
      'Permanently deletes the website data in the half-open range [startAt, endAt) and keeps the website configuration. Requires relational storage.',
    tags: ['Websites'],
    requestParams: {
      path: websiteIdPathSchema,
    },
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: websiteDataRangeSchema,
        },
      },
    },
    responses: {
      '200': jsonResponse(websiteDataCountsSchema, 'Counts of the rows that were deleted.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [getWebsiteClearPreviewOperation, clearWebsiteDataOperation] as const;
