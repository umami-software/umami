import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getOauthClient } from '@/queries/prisma/oauth';
import {
  clearClientMetadataCache,
  fetchClientMetadata,
  isClientMetadataUrl,
  resolveOAuthClient,
  validateClientMetadata,
} from './client';

vi.mock('@/lib/redis', () => ({
  default: { enabled: false, client: { get: vi.fn(), set: vi.fn() } },
}));

vi.mock('@/queries/prisma/oauth', () => ({
  getOauthClient: vi.fn(),
}));

const getOauthClientMock = vi.mocked(getOauthClient);
const CLIENT_ID = 'https://app.example.com/oauth/client.json';

const validDocument = {
  client_id: CLIENT_ID,
  client_name: 'Example MCP Client',
  client_uri: 'https://app.example.com',
  redirect_uris: ['http://127.0.0.1:3000/callback', 'https://app.example.com/callback'],
  token_endpoint_auth_method: 'none',
};

beforeEach(() => {
  clearClientMetadataCache();
  getOauthClientMock.mockReset();
});

describe('isClientMetadataUrl', () => {
  test('requires https, a path and a public host', () => {
    expect(isClientMetadataUrl(CLIENT_ID)).toBe(true);
    expect(isClientMetadataUrl('https://app.example.com')).toBe(false);
    expect(isClientMetadataUrl('https://app.example.com/')).toBe(false);
    expect(isClientMetadataUrl('http://app.example.com/client.json')).toBe(false);
    expect(isClientMetadataUrl('https://localhost/client.json')).toBe(false);
    expect(isClientMetadataUrl('https://10.0.0.1/client.json')).toBe(false);
    expect(isClientMetadataUrl('https://user:pw@app.example.com/client.json')).toBe(false);
    expect(isClientMetadataUrl('not-a-url')).toBe(false);
  });
});

describe('validateClientMetadata', () => {
  test('accepts a valid document', () => {
    expect(validateClientMetadata(CLIENT_ID, validDocument)).toMatchObject({
      clientId: CLIENT_ID,
      clientName: 'Example MCP Client',
      redirectUris: validDocument.redirect_uris,
      source: 'metadata-document',
    });
  });

  test('rejects mismatched client_id', () => {
    expect(() =>
      validateClientMetadata(CLIENT_ID, { ...validDocument, client_id: 'https://other/x.json' }),
    ).toThrow(/does not match/);
  });

  test('rejects missing or invalid redirect URIs and names', () => {
    expect(() =>
      validateClientMetadata(CLIENT_ID, { ...validDocument, redirect_uris: [] }),
    ).toThrow(/redirect_uris/);
    expect(() =>
      validateClientMetadata(CLIENT_ID, {
        ...validDocument,
        redirect_uris: ['http://app.example.com/cb'],
      }),
    ).toThrow(/redirect_uris/);
    expect(() =>
      validateClientMetadata(CLIENT_ID, { ...validDocument, client_name: undefined }),
    ).toThrow(/client_name/);
  });

  test('rejects confidential clients', () => {
    expect(() =>
      validateClientMetadata(CLIENT_ID, {
        ...validDocument,
        token_endpoint_auth_method: 'client_secret_basic',
      }),
    ).toThrow(/public clients/);
  });
});

describe('fetchClientMetadata', () => {
  test('fetches and validates the document', async () => {
    const fetchImpl = vi.fn(async () => Response.json(validDocument));
    const client = await fetchClientMetadata(CLIENT_ID, fetchImpl);

    expect(client.clientName).toBe('Example MCP Client');
    expect(fetchImpl).toHaveBeenCalledWith(
      CLIENT_ID,
      expect.objectContaining({ method: 'GET', redirect: 'error' }),
    );
  });

  test('maps fetch failures to invalid_client', async () => {
    await expect(
      fetchClientMetadata(CLIENT_ID, async () => new Response('nope', { status: 404 })),
    ).rejects.toMatchObject({ code: 'invalid_client' });
    await expect(
      fetchClientMetadata(CLIENT_ID, async () => new Response('{bad json')),
    ).rejects.toMatchObject({ code: 'invalid_client_metadata' });
    await expect(
      fetchClientMetadata(CLIENT_ID, async () => {
        throw new TypeError('fetch failed');
      }),
    ).rejects.toMatchObject({ code: 'invalid_client' });
  });
});

describe('resolveOAuthClient', () => {
  test('caches metadata documents', async () => {
    const fetchImpl = vi.fn(async () => Response.json(validDocument));

    await resolveOAuthClient(CLIENT_ID, { fetch: fetchImpl });
    await resolveOAuthClient(CLIENT_ID, { fetch: fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  test('resolves registered clients from the database', async () => {
    getOauthClientMock.mockResolvedValue({
      id: 'registered-1',
      name: 'Registered',
      redirectUris: ['https://a.example/cb'],
      metadata: { client_uri: 'https://a.example' },
      createdAt: new Date(),
    } as never);

    await expect(resolveOAuthClient('registered-1')).resolves.toMatchObject({
      clientId: 'registered-1',
      clientName: 'Registered',
      clientUri: 'https://a.example',
      source: 'registered',
    });
  });

  test('rejects unknown and malformed client ids', async () => {
    getOauthClientMock.mockResolvedValue(null);

    await expect(resolveOAuthClient('missing')).rejects.toMatchObject({ code: 'invalid_client' });
    await expect(resolveOAuthClient('http://insecure.example/x.json')).rejects.toMatchObject({
      code: 'invalid_client',
    });
    await expect(resolveOAuthClient('')).rejects.toMatchObject({ code: 'invalid_client' });
  });
});
