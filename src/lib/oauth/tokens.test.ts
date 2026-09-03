import { beforeAll, describe, expect, test } from 'vitest';
import {
  createAccessToken,
  generateRefreshToken,
  hashToken,
  isRefreshToken,
  looksLikeAccessToken,
  verifyAccessToken,
} from './tokens';

const ISSUER = 'https://analytics.example.com';
const RESOURCE = `${ISSUER}/mcp`;

beforeAll(() => {
  process.env.APP_SECRET = 'oauth-test-secret';
});

describe('access tokens', () => {
  test('round-trips claims and binds the audience to the issuer', () => {
    const { token, jti, expiresIn } = createAccessToken({
      userId: 'user-1',
      clientId: 'https://client.example/metadata.json',
      scopes: ['websites:read', 'analytics:read', 'bogus'],
      issuer: ISSUER,
      resource: RESOURCE,
      passwordHash: 'pw',
    });

    expect(expiresIn).toBe(3600);
    expect(looksLikeAccessToken(token)).toBe(true);

    const verified = verifyAccessToken(token);

    expect(verified).toMatchObject({
      userId: 'user-1',
      clientId: 'https://client.example/metadata.json',
      scopes: ['analytics:read', 'websites:read'],
      issuer: ISSUER,
      resource: RESOURCE,
      tokenId: jti,
    });
    expect(verified?.passwordFingerprint).toBeDefined();
    expect(verified?.expiresAt).toBeGreaterThan(Date.now());
  });

  test('rejects tokens whose audience is not the issuer MCP resource', () => {
    const { token } = createAccessToken({
      userId: 'user-1',
      clientId: 'c',
      scopes: ['websites:read'],
      issuer: ISSUER,
      resource: 'https://other.example/mcp',
    });

    expect(verifyAccessToken(token)).toBeNull();
  });

  test('rejects expired tokens', () => {
    const { token } = createAccessToken({
      userId: 'user-1',
      clientId: 'c',
      scopes: ['websites:read'],
      issuer: ISSUER,
      resource: RESOURCE,
      expiresInSeconds: -10,
    });

    expect(verifyAccessToken(token)).toBeNull();
  });

  test('rejects tampered and foreign tokens', () => {
    const { token } = createAccessToken({
      userId: 'user-1',
      clientId: 'c',
      scopes: ['websites:read'],
      issuer: ISSUER,
      resource: RESOURCE,
    });
    const [header, payload] = token.split('.');

    expect(verifyAccessToken(`${header}.${payload}.invalid`)).toBeNull();
    expect(looksLikeAccessToken('umami_abc')).toBe(false);
    expect(looksLikeAccessToken('a.b')).toBe(false);
  });
});

describe('refresh tokens', () => {
  test('generates prefixed tokens and stable hashes', () => {
    const token = generateRefreshToken();

    expect(isRefreshToken(token)).toBe(true);
    expect(isRefreshToken('nope')).toBe(false);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });
});
