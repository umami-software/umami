import { describe, expect, test } from 'vitest';
import { createSecureToken, createToken, parseSecureToken, parseToken } from './jwt';

const SECRET = 'test-secret';

describe('createToken/parseToken', () => {
  test('round-trips a payload with the correct secret', () => {
    const token = createToken({ userId: '123' }, SECRET);
    const parsed = parseToken(token, SECRET) as any;

    expect(parsed.userId).toBe('123');
  });

  test('returns null for an invalid token', () => {
    expect(parseToken('not-a-jwt', SECRET)).toBeNull();
  });

  test('returns null when verified with the wrong secret', () => {
    const token = createToken({ userId: '123' }, SECRET);

    expect(parseToken(token, 'wrong-secret')).toBeNull();
  });
});

describe('createSecureToken/parseSecureToken', () => {
  test('round-trips an encrypted token with the correct secret', () => {
    const token = createSecureToken({ userId: '456' }, SECRET);
    const parsed = parseSecureToken(token, SECRET) as any;

    expect(parsed.userId).toBe('456');
  });

  test('produces an opaque (encrypted) token, not a raw jwt', () => {
    const token = createSecureToken({ userId: '456' }, SECRET);

    // Raw jwts have exactly two dots; the encrypted wrapper is base64.
    expect(token.split('.').length).not.toBe(3);
  });

  test('returns null when parsed with the wrong secret', () => {
    const token = createSecureToken({ userId: '456' }, SECRET);

    expect(parseSecureToken(token, 'wrong-secret')).toBeNull();
  });

  test('returns null for a malformed secure token', () => {
    expect(parseSecureToken('garbage', SECRET)).toBeNull();
  });
});
