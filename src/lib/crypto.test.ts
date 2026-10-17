import { describe, expect, test, vi } from 'vitest';
import { decrypt, encrypt, getSalt, hash, md5, uuid } from './crypto';

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

describe('getSalt', () => {
  const date = new Date('2026-09-17T15:30:00Z');
  const sameDay = new Date('2026-09-17T18:00:00Z');
  const nextDay = new Date('2026-09-18T15:30:00Z');
  const nextMonth = new Date('2026-10-17T15:30:00Z');

  test('defaults to monthly rotation when unset or empty', () => {
    const monthly = getSalt('monthly', date);

    expect(getSalt(undefined, date)).toBe(monthly);
    expect(getSalt('', date)).toBe(monthly);
    expect(getSalt('   ', date)).toBe(monthly);
    expect(getSalt(undefined, nextDay)).toBe(monthly);
    expect(getSalt(undefined, nextMonth)).not.toBe(monthly);
  });

  test('accepts both short and long period names', () => {
    expect(getSalt('day', date)).toBe(getSalt('daily', date));
    expect(getSalt('week', date)).toBe(getSalt('weekly', date));
    expect(getSalt('month', date)).toBe(getSalt('monthly', date));
    expect(getSalt('Daily', date)).toBe(getSalt('daily', date));
  });

  test('daily rotation changes each day', () => {
    expect(getSalt('daily', date)).toBe(getSalt('daily', sameDay));
    expect(getSalt('daily', date)).not.toBe(getSalt('daily', nextDay));
  });

  test('monthly rotation changes each month', () => {
    expect(getSalt('monthly', date)).toBe(getSalt('monthly', nextDay));
    expect(getSalt('monthly', date)).not.toBe(getSalt('monthly', nextMonth));
  });

  test('uses the hash of any other string as a fixed salt', () => {
    const salt = getSalt('my-custom-salt', date);

    expect(salt).toBe(hash('my-custom-salt'));
    expect(salt).not.toContain('my-custom-salt');
    expect(getSalt('my-custom-salt', nextMonth)).toBe(salt);
    expect(getSalt('other-salt', date)).not.toBe(salt);
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
