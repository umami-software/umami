import crypto from 'node:crypto';

export const PKCE_METHODS = ['S256'] as const;
export type PkceMethod = (typeof PKCE_METHODS)[number];

const VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]{43,128}$/;
const CHALLENGE_PATTERN = /^[A-Za-z0-9\-_]{43}$/;

export function isPkceMethod(value: unknown): value is PkceMethod {
  return typeof value === 'string' && (PKCE_METHODS as readonly string[]).includes(value);
}

export function isValidCodeChallenge(value: unknown): value is string {
  return typeof value === 'string' && CHALLENGE_PATTERN.test(value);
}

export function isValidCodeVerifier(value: unknown): value is string {
  return typeof value === 'string' && VERIFIER_PATTERN.test(value);
}

export function computeCodeChallenge(verifier: string) {
  return crypto.createHash('sha256').update(verifier, 'ascii').digest('base64url');
}

export function verifyPkce(verifier: unknown, challenge: string, method: string) {
  if (method !== 'S256' || !isValidCodeVerifier(verifier)) {
    return false;
  }

  const expected = Buffer.from(challenge);
  const actual = Buffer.from(computeCodeChallenge(verifier));

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/** URL-safe random secret used for authorization codes and refresh tokens. */
export function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
