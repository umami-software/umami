import bcrypt from 'bcryptjs';
import { describe, expect, test, vi } from 'vitest';
import { checkPassword, checkUserPassword, hashPassword } from './password';

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

describe('checkUserPassword', () => {
  test('accepts the right password and refuses a wrong one', () => {
    const hash = hashPassword('correct horse', 4);

    expect(checkUserPassword('correct horse', hash)).toBe(true);
    expect(checkUserPassword('wrong', hash)).toBe(false);
  });

  test('refuses when there is no user, after comparing all the same', () => {
    const compare = vi.spyOn(bcrypt, 'compareSync');

    expect(checkUserPassword('anything', undefined)).toBe(false);
    expect(checkUserPassword('anything', null)).toBe(false);
    expect(compare).toHaveBeenCalledTimes(2);
    compare.mockRestore();
  });
});
