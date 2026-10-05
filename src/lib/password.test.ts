import { describe, expect, test } from 'vitest';
import { checkPassword, hashPassword } from './password';

describe('hashPassword', () => {
  test('returns a bcrypt hash distinct from the plaintext', () => {
    const hash = hashPassword('correct horse');

    expect(hash).not.toBe('correct horse');
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test('produces different hashes for the same password (random salt)', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });
});

describe('checkPassword', () => {
  test('accepts the correct password', () => {
    const hash = hashPassword('correct horse');

    expect(checkPassword('correct horse', hash)).toBe(true);
  });

  test('rejects the wrong password', () => {
    const hash = hashPassword('correct horse');

    expect(checkPassword('wrong horse', hash)).toBe(false);
  });
});
