import { defineOperation } from '@/openapi/operation';
import { badRequestResponse, jsonResponse, unauthorizedResponse } from '@/openapi/schemas';
import {
  authorizationDecisionSchema,
  authorizationDetailsSchema,
  authorizationRedirectSchema,
  authorizationRequestSchema,
  oauthErrorSchema,
} from '../schema';

const describeAuthorizationOperation = defineOperation({
  method: 'get',
  path: '/api/oauth/authorize',
  audience: 'internal',
  auth: 'bearer',
  operation: {
    operationId: 'describeOAuthAuthorization',
    summary: 'Describe a pending OAuth authorization request',
    description:
      'Validates an OAuth 2.1 authorization request and returns the client and scopes for the consent screen. Requires an interactive user session.',
    tags: ['OAuth'],
    requestParams: { query: authorizationRequestSchema },
    responses: {
      '200': jsonResponse(authorizationDetailsSchema, 'Authorization request details.'),
      '400': jsonResponse(oauthErrorSchema, 'Invalid authorization request.'),
      '401': unauthorizedResponse,
    },
  },
});

const decideAuthorizationOperation = defineOperation({
  method: 'post',
  path: '/api/oauth/authorize',
  audience: 'internal',
  auth: 'bearer',
  operation: {
    operationId: 'decideOAuthAuthorization',
    summary: 'Approve or deny an OAuth authorization request',
    description:
      'Records the user decision. On approval an authorization code is issued and the redirect URL (with code, state and iss) is returned.',
    tags: ['OAuth'],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: authorizationDecisionSchema } },
    },
    responses: {
      '200': jsonResponse(authorizationRedirectSchema, 'Redirect URL for the browser.'),
      '400': badRequestResponse,
      '401': unauthorizedResponse,
    },
  },
});

export const operations = [describeAuthorizationOperation, decideAuthorizationOperation] as const;
