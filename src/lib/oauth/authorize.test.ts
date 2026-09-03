import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createAuthorizationCode } from '@/queries/prisma/oauth';
import {
  buildErrorRedirect,
  buildSuccessRedirect,
  issueAuthorizationCode,
  validateAuthorizationRequest,
} from './authorize';
import { resolveOAuthClient } from './client';
import { OAuthError } from './errors';
import { computeCodeChallenge } from './pkce';

vi.mock('./client', () => ({
  resolveOAuthClient: vi.fn(),
}));

vi.mock('@/queries/prisma/oauth', () => ({
  createAuthorizationCode: vi.fn(),
}));

const resolveOAuthClientMock = vi.mocked(resolveOAuthClient);
const createAuthorizationCodeMock = vi.mocked(createAuthorizationCode);

const ISSUER = 'https://analytics.example.com';
const CLIENT = {
  clientId: 'https://app.example.com/client.json',
  clientName: 'App',
  redirectUris: ['https://app.example.com/cb', 'http://127.0.0.1:1/cb'],
  source: 'metadata-document' as const,
};
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

function request(overrides: Record<string, unknown> = {}) {
  return {
    response_type: 'code',
    client_id: CLIENT.clientId,
    redirect_uri: 'https://app.example.com/cb',
    scope: 'websites:read analytics:read',
    state: 'xyz',
    code_challenge: computeCodeChallenge(VERIFIER),
    code_challenge_method: 'S256',
    resource: `${ISSUER}/mcp`,
    ...overrides,
  };
}

beforeEach(() => {
  process.env.APP_SECRET = 'test';
  resolveOAuthClientMock.mockReset();
  resolveOAuthClientMock.mockResolvedValue(CLIENT);
  createAuthorizationCodeMock.mockReset();
  createAuthorizationCodeMock.mockResolvedValue({} as never);
});

describe('validateAuthorizationRequest', () => {
  test('accepts a valid request', async () => {
    await expect(validateAuthorizationRequest(request(), ISSUER)).resolves.toMatchObject({
      client: CLIENT,
      redirectUri: 'https://app.example.com/cb',
      scopes: ['analytics:read', 'websites:read'],
      state: 'xyz',
      codeChallengeMethod: 'S256',
      resource: `${ISSUER}/mcp`,
    });
  });

  test('defaults to all scopes and the MCP resource when omitted', async () => {
    const result = await validateAuthorizationRequest(
      request({ scope: undefined, resource: undefined }),
      ISSUER,
    );

    expect(result.scopes).toEqual(['analytics:read', 'websites:read']);
    expect(result.resource).toBe(`${ISSUER}/mcp`);
  });

  test('allows loopback redirect ports to vary', async () => {
    const result = await validateAuthorizationRequest(
      request({ redirect_uri: 'http://127.0.0.1:54321/cb' }),
      ISSUER,
    );

    expect(result.redirectUri).toBe('http://127.0.0.1:1/cb');
  });

  test('rejects unregistered redirect URIs before anything else (not redirectable)', async () => {
    const error = await validateAuthorizationRequest(
      request({ redirect_uri: 'https://evil.example/cb', response_type: 'token' }),
      ISSUER,
    ).catch(e => e);

    expect(error).toBeInstanceOf(OAuthError);
    expect(error.code).toBe('invalid_redirect_uri');
    expect(error.redirectable).toBe(false);
  });

  test('requires PKCE S256', async () => {
    await expect(
      validateAuthorizationRequest(request({ code_challenge: undefined }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_request', redirectable: true });
    await expect(
      validateAuthorizationRequest(request({ code_challenge_method: 'plain' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_request' });
  });

  test('rejects unknown scopes, response types and resources', async () => {
    await expect(
      validateAuthorizationRequest(request({ scope: 'websites:write' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_scope' });
    await expect(
      validateAuthorizationRequest(request({ response_type: 'token' }), ISSUER),
    ).rejects.toMatchObject({ code: 'unsupported_response_type' });
    await expect(
      validateAuthorizationRequest(request({ resource: 'https://other.example/mcp' }), ISSUER),
    ).rejects.toMatchObject({ code: 'invalid_target' });
  });

  test('propagates client resolution errors', async () => {
    resolveOAuthClientMock.mockRejectedValue(new OAuthError('invalid_client', 'Unknown'));

    await expect(validateAuthorizationRequest(request(), ISSUER)).rejects.toMatchObject({
      code: 'invalid_client',
    });
  });
});

describe('issueAuthorizationCode', () => {
  test('stores a hashed, expiring, PKCE-bound code and builds the redirect', async () => {
    const validated = await validateAuthorizationRequest(request(), ISSUER);
    const code = await issueAuthorizationCode(validated, 'user-1');

    expect(code.length).toBeGreaterThanOrEqual(43);
    expect(createAuthorizationCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        clientId: CLIENT.clientId,
        redirectUri: 'https://app.example.com/cb',
        scope: 'analytics:read websites:read',
        codeChallenge: computeCodeChallenge(VERIFIER),
        codeChallengeMethod: 'S256',
      }),
    );

    const stored = createAuthorizationCodeMock.mock.calls[0][0];

    expect(stored.codeHash).not.toContain(code);
    expect(stored.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 10 * 60 * 1000);

    const redirect = new URL(buildSuccessRedirect(validated, code, ISSUER));

    expect(redirect.origin + redirect.pathname).toBe('https://app.example.com/cb');
    expect(redirect.searchParams.get('code')).toBe(code);
    expect(redirect.searchParams.get('state')).toBe('xyz');
    expect(redirect.searchParams.get('iss')).toBe(ISSUER);
  });

  test('builds error redirects with iss and state', () => {
    const redirect = new URL(
      buildErrorRedirect(
        'https://app.example.com/cb',
        new OAuthError('access_denied', 'Denied'),
        'st',
        ISSUER,
      ),
    );

    expect(redirect.searchParams.get('error')).toBe('access_denied');
    expect(redirect.searchParams.get('state')).toBe('st');
    expect(redirect.searchParams.get('iss')).toBe(ISSUER);
  });
});
