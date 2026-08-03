import { describe, expect, test, vi } from 'vitest';
import { decrypt, encrypt, hash, md5, uuid } from './crypto';

describe('encrypt/decrypt', () => {
  test('round-trips a value with the same secret', () => {
    const secret = 'my-secret';
    const value = 'hello world';

    const encrypted = encrypt(value, secret);

    expect(encrypted).not.toBe(value);
    expect(decrypt(encrypted, secret)).toBe(value);
  });

  test('produces different ciphertext on each call (random iv/salt)', () => {
    const secret = 'my-secret';

    expect(encrypt('same', secret)).not.toBe(encrypt('same', secret));
  });

  test('fails to decrypt with the wrong secret', () => {
    const encrypted = encrypt('secret data', 'right-secret');

    expect(() => decrypt(encrypted, 'wrong-secret')).toThrow();
  });

  test('fails to decrypt tampered ciphertext', () => {
    const secret = 'my-secret';
    const encrypted = encrypt('secret data', secret);

    const buf = Buffer.from(encrypted, 'base64');
    buf[buf.length - 1] ^= 0xff;
    const tampered = buf.toString('base64');

    expect(() => decrypt(tampered, secret)).toThrow();
  });
});

describe('hash', () => {
  test('is deterministic for the same input', () => {
    expect(hash('a', 'b', 'c')).toBe(hash('a', 'b', 'c'));
  });

  test('returns a 128-char sha512 hex string', () => {
    expect(hash('umami')).toMatch(/^[0-9a-f]{128}$/);
  });

  test('changes when input changes', () => {
    expect(hash('a')).not.toBe(hash('b'));
  });
});

describe('md5', () => {
  test('is deterministic for the same input', () => {
    expect(md5('a', 'b')).toBe(md5('a', 'b'));
  });

  test('returns a 32-char hex string', () => {
    expect(md5('umami')).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('uuid', () => {
  test('returns a v4 uuid with no args', () => {
    vi.stubEnv('USE_UUIDV7', '');

    expect(uuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    vi.unstubAllEnvs();
  });

  test('is deterministic (v5) for the same args', () => {
    vi.stubEnv('APP_SECRET', 'test-secret');

    expect(uuid('a', 'b')).toBe(uuid('a', 'b'));

    vi.unstubAllEnvs();
  });

  test('differs for different args', () => {
    vi.stubEnv('APP_SECRET', 'test-secret');

    expect(uuid('a')).not.toBe(uuid('b'));

    vi.unstubAllEnvs();
  });
});
