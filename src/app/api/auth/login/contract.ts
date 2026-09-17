import { z } from 'zod';
import { defineOperation } from '@/openapi/operation';
import {
  badRequestResponse,
  jsonResponse,
  serviceUnavailableResponse,
  unauthorizedResponse,
} from '@/openapi/schemas';
import { loginRequestSchema } from './schema';

const loginTeamSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    logoUrl: z.string().nullable(),
  })
  .meta({ id: 'LoginTeam' });

const loginUserSchema = z
  .object({
    id: z.uuid(),
    username: z.string(),
    role: z.string(),
    createdAt: z.iso.datetime().nullable(),
    isAdmin: z.boolean(),
    teams: z.array(loginTeamSchema),
  })
  .meta({ id: 'LoginUser' });

export const loginResponseSchema = z
  .union([
    z.object({
      requiresTwoFactor: z.literal(true),
      partialToken: z.string(),
    }),
    z.object({
      token: z.string(),
      user: loginUserSchema,
    }),
  ])
  .meta({ id: 'LoginResponse' });

const loginOperation = defineOperation({
  method: 'post',
  path: '/api/auth/login',
  audience: 'public',
  auth: 'none',
  operation: {
    operationId: 'login',
    summary: 'Log in',
    description:
      'Authenticates a self-hosted Umami user. Users with two-factor authentication receive a short-lived partial token instead of a full bearer token.',
    tags: ['Authentication'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: loginRequestSchema,
        },
      },
    },
    responses: {
      '200': jsonResponse(loginResponseSchema, 'Authenticated successfully.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
      '503': serviceUnavailableResponse,
    },
  },
});

export const operations = [loginOperation] as const;
