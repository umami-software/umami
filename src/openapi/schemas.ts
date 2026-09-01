import { z } from 'zod';
import type { ZodOpenApiResponseObject } from 'zod-openapi';

export const apiErrorSchema = z
  .object({
    error: z.looseObject({
      message: z.string(),
      code: z.string(),
      status: z.number().int(),
    }),
  })
  .meta({ id: 'ApiError', description: 'Standard Umami API error response.' });

export const okSchema = z
  .object({
    ok: z.literal(true),
  })
  .meta({ id: 'Ok', description: 'Successful operation response.' });

export function jsonResponse(
  schema: z.ZodType,
  description = 'Successful response.',
): ZodOpenApiResponseObject {
  return {
    description,
    content: {
      'application/json': {
        schema,
      },
    },
  };
}

function errorResponse(
  id: string,
  status: number,
  code: string,
  description: string,
): ZodOpenApiResponseObject {
  return {
    id,
    description,
    content: {
      'application/json': {
        schema: apiErrorSchema,
        example: {
          error: {
            message: description,
            code,
            status,
          },
        },
      },
    },
  };
}

export const badRequestResponse = errorResponse(
  'BadRequestResponse',
  400,
  'bad-request',
  'Bad request.',
);
export const unauthorizedResponse = errorResponse(
  'UnauthorizedResponse',
  401,
  'unauthorized',
  'Unauthorized.',
);
export const forbiddenResponse = errorResponse('ForbiddenResponse', 403, 'forbidden', 'Forbidden.');
export const notFoundResponse = errorResponse('NotFoundResponse', 404, 'not-found', 'Not found.');
export const payloadTooLargeResponse = errorResponse(
  'PayloadTooLargeResponse',
  413,
  'payload-too-large',
  'Payload too large.',
);
export const serverErrorResponse = errorResponse(
  'ServerErrorResponse',
  500,
  'server-error',
  'Server error.',
);
export const serviceUnavailableResponse = errorResponse(
  'ServiceUnavailableResponse',
  503,
  'service-unavailable',
  'Service unavailable.',
);
