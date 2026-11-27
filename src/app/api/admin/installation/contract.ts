import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  forbiddenResponse,
  jsonResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';

export const installationQuerySchema = z.object({
  section: z.enum(['inventory', 'records']).optional(),
});

const installationInventorySchema = z.object({
  users: z.number(),
  teams: z.number().describe('Number of teams in the installation.'),
  websites: z.number(),
});

const installationRecordsSchema = z.object({
  websiteEvents: z.number().describe('Number of rows in the website_event table.'),
  sessions: z.number().describe('Number of rows in the PostgreSQL session table.'),
});

export type InstallationInventory = z.infer<typeof installationInventorySchema>;
export type InstallationRecords = z.infer<typeof installationRecordsSchema>;

export const operations = [
  defineOperation({
    method: 'get',
    path: '/api/admin/installation',
    audience: 'internal',
    auth: 'bearer',
    operation: {
      operationId: 'getInstallation',
      summary: 'Get installation totals',
      description:
        'Returns inventory totals by default or event and session table row counts when section is records. Requires a self-hosted administrator session or a signed-in user session when ENABLE_SETTINGS is enabled.',
      tags: ['Administration'],
      requestParams: { query: installationQuerySchema },
      responses: {
        '200': jsonResponse(
          z.union([installationInventorySchema, installationRecordsSchema]),
          'Installation totals for the requested section.',
        ),
        '400': badRequestResponse,
        '401': unauthorizedResponse,
        '403': forbiddenResponse,
        '404': notFoundResponse,
      },
    },
  }),
] as const;
