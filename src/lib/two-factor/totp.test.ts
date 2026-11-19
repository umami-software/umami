import { generateSecret, generateSync } from 'otplib';
import { describe, expect, test } from 'vitest';
import { generateOtpAuthUri, generateTotpSecret, verifyTotp } from './totp';

describe('generateTotpSecret', () => {
  test('returns a base32 secret string', () => {
    const secret = generateTotpSecret();

    expect(typeof secret).toBe('string');
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  test('returns a different secret each call', () => {
    expect(generateTotpSecret()).not.toBe(generateTotpSecret());
  });
});

describe('generateOtpAuthUri', () => {
  test('builds an otpauth uri containing issuer, label and secret', () => {
    const secret = generateTotpSecret();
    const uri = generateOtpAuthUri(secret, 'alice');

    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('issuer=Umami');
    expect(uri).toContain('alice');
    expect(uri).toContain(`secret=${secret}`);
  });
});

describe('verifyTotp', () => {
  test('verifies a token generated for the current time step', async () => {
    const secret = generateSecret();
    const token = generateSync({ secret });

    expect(await verifyTotp(token, secret)).toBe(true);
  });

  test('rejects an incorrect token', async () => {
    const secret = generateSecret();

    expect(await verifyTotp('000000', secret)).toBe(false);
  });

  test('rejects a valid token verified against a different secret', async () => {
    const token = generateSync({ secret: generateSecret() });

    expect(await verifyTotp(token, generateSecret())).toBe(false);
  });
});
