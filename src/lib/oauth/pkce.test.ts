import { describe, expect, test } from 'vitest';
import {
  computeCodeChallenge,
  generateSecret,
  isValidCodeChallenge,
  isValidCodeVerifier,
  verifyPkce,
} from './pkce';

// RFC 7636 Appendix B test vector.
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('pkce', () => {
  test('computes S256 challenges', () => {
    expect(computeCodeChallenge(VERIFIER)).toBe(CHALLENGE);
  });

  test('verifies matching verifiers and rejects mismatches', () => {
    expect(verifyPkce(VERIFIER, CHALLENGE, 'S256')).toBe(true);
    expect(verifyPkce(`${VERIFIER.slice(0, -1)}x`, CHALLENGE, 'S256')).toBe(false);
    expect(verifyPkce(VERIFIER, CHALLENGE, 'plain')).toBe(false);
    expect(verifyPkce(undefined, CHALLENGE, 'S256')).toBe(false);
  });

  test('validates verifier and challenge formats', () => {
    expect(isValidCodeVerifier(VERIFIER)).toBe(true);
    expect(isValidCodeVerifier('short')).toBe(false);
    expect(isValidCodeChallenge(CHALLENGE)).toBe(true);
    expect(isValidCodeChallenge('not base64url!')).toBe(false);
  });

  test('generates URL-safe secrets', () => {
    const secret = generateSecret();

    expect(secret).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(43);
    expect(generateSecret()).not.toBe(secret);
  });
});
