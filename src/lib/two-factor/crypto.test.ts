import { describe, expect, test, vi } from 'vitest';

const KEY = 'a'.repeat(64);

describe('encryptSecret/decryptSecret', () => {
  test('round-trips a secret with a valid key', async () => {
    vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', KEY);
    vi.resetModules();
    const { encryptSecret, decryptSecret } = await import('./crypto');

    const plaintext = 'JBSWY3DPEHPK3PXP';
    const stored = encryptSecret(plaintext);

    expect(stored).not.toContain(plaintext);
    expect(stored.split(':')).toHaveLength(3);
    expect(decryptSecret(stored)).toBe(plaintext);

    vi.unstubAllEnvs();
  });

  test('produces different ciphertext each call (random iv)', async () => {
    vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', KEY);
    vi.resetModules();
    const { encryptSecret } = await import('./crypto');

    expect(encryptSecret('same')).not.toBe(encryptSecret('same'));

    vi.unstubAllEnvs();
  });

  test('fails to decrypt tampered ciphertext', async () => {
    vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', KEY);
    vi.resetModules();
    const { encryptSecret, decryptSecret } = await import('./crypto');

    const [ciphertext, iv, tag] = encryptSecret('secret').split(':');
    const flipped = (ciphertext[0] === 'f' ? '0' : 'f') + ciphertext.slice(1);

    expect(() => decryptSecret(`${flipped}:${iv}:${tag}`)).toThrow();

    vi.unstubAllEnvs();
  });

  test('throws when the encryption key is missing or invalid', async () => {
    vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', 'too-short');
    vi.resetModules();
    const { encryptSecret } = await import('./crypto');

    expect(() => encryptSecret('secret')).toThrow(/missing or invalid/);

    vi.unstubAllEnvs();
  });
});
