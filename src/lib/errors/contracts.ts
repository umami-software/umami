import { z } from 'zod';
import { type ApiHttpMethod, defineOperation } from '@/openapi/operation';
import { apiErrorSchema, jsonResponse, okSchema } from '@/openapi/schemas';
import { errorStatusSchema } from './schema';

const timestamp = z.string();
const totals = z.object({
  occurrences: z.number(),
  visits: z.number(),
  issues: z.number(),
  firstSeen: timestamp.nullable(),
  lastSeen: timestamp.nullable(),
  series: z.array(z.object({ date: z.string(), occurrences: z.number() })),
});
const issue = z.object({
  id: z.uuid(),
  websiteId: z.uuid(),
  fingerprint: z.string(),
  groupingVersion: z.number(),
  title: z.string(),
  status: errorStatusSchema,
  resolvedAt: timestamp.nullable(),
  createdAt: timestamp,
  occurrences: z.number(),
  visits: z.number(),
  firstSeen: timestamp.nullable(),
  lastSeen: timestamp.nullable(),
});
const event = z.object({
  id: z.uuid(),
  createdAt: timestamp,
  name: z.string(),
  message: z.string(),
  handled: z.boolean(),
  release: z.string(),
  environment: z.string(),
  browser: z.string(),
  os: z.string(),
  device: z.string(),
  urlPath: z.string(),
  sessionId: z.uuid(),
  visitId: z.uuid(),
});
const page = <T extends z.ZodType>(item: T) =>
  z.object({
    data: z.array(item),
    count: z.number(),
    page: z.number(),
    pageSize: z.number(),
  });
export const errorResponses = {
  issues: page(issue),
  stats: totals,
  issue: issue.extend(totals.shape),
  events: page(event),
  event: event.extend({
    stack: z.string(),
    frames: z.array(
      z.object({
        filename: z.string(),
        function: z.string(),
        line: z.number(),
        column: z.number(),
      }),
    ),
    tags: z.record(z.string(), z.string()),
    replayId: z.uuid().nullable(),
  }),
  values: z.array(z.object({ value: z.string(), count: z.number() })),
  settings: z.object({ enabled: z.boolean(), retentionDays: z.number(), canManage: z.boolean() }),
  ok: okSchema,
};

export function errorOperation({
  method = 'get',
  path,
  operationId,
  summary,
  response,
  query,
  body,
}: {
  method?: ApiHttpMethod;
  path: `/api/${string}`;
  operationId: string;
  summary: string;
  response: z.ZodType;
  query?: z.ZodObject;
  body?: z.ZodType;
}) {
  const pathFields = Object.fromEntries(
    [...path.matchAll(/\{(\w+)\}/g)].map(match => [match[1], z.uuid()]),
  );
  return defineOperation({
    method,
    path,
    audience: 'public',
    auth: 'bearer',
    operation: {
      operationId,
      summary,
      tags: ['Errors'],
      requestParams: { path: z.object(pathFields), ...(query ? { query } : {}) },
      ...(body
        ? { requestBody: { required: true, content: { 'application/json': { schema: body } } } }
        : {}),
      responses: {
        '200': jsonResponse(response),
        '400': jsonResponse(apiErrorSchema, 'Invalid request.'),
        '401': jsonResponse(apiErrorSchema, 'Authenticated website access required.'),
        '404': jsonResponse(apiErrorSchema, 'Website, issue, or occurrence not found.'),
      },
    },
  });
}
