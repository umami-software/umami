import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  notFoundResponse,
  okSchema,
  unauthorizedResponse,
} from '@/openapi/schemas';

const sessionPathSchema = z.object({ websiteId: z.uuid(), sessionId: z.uuid() });

const websiteSessionDetailsSchema = z.looseObject({
  id: z.uuid(),
  websiteId: z.uuid(),
  distinctId: z.string().optional().meta({
    description: 'Distinct ID of the session. Omitted unless exactly one distinct ID is linked.',
  }),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  device: z.string().nullable(),
  screen: z.string().nullable(),
  language: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  firstAt: z.iso.datetime(),
  lastAt: z.iso.datetime(),
  visits: z.number(),
  views: z.number(),
  events: z.number(),
  totaltime: z.number(),
  canDelete: z.boolean().meta({
    description: 'Whether the caller can delete this session.',
  }),
  distinctIds: z.array(z.string()).meta({
    description: 'Distinct IDs linked to the session.',
  }),
  stitchedSessionCount: z.number().int().nonnegative().meta({
    description: 'Number of sessions merged through the distinct ID, including this one.',
  }),
});

export const operations = [
  defineOperation({
    method: 'delete',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId: 'deleteWebsiteSession',
      tags: ['Websites'],
      requestParams: { path: sessionPathSchema },
      responses: {
        '200': jsonResponse(okSchema, 'The operation completed successfully.'),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
  defineOperation({
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    audience: 'public',
    auth: 'bearer-or-share',
    operation: {
      operationId: 'getWebsiteSession',
      tags: ['Websites'],
      requestParams: { path: sessionPathSchema },
      responses: {
        '200': jsonResponse(websiteSessionDetailsSchema, 'The operation completed successfully.'),
        '401': unauthorizedResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
