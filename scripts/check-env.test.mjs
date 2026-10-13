import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectEnvErrors,
  getAppSecretError,
  getMissingEnvVars,
  getTwoFactorEncryptionKeyError,
} from './env-checks.js';

test('getMissingEnvVars returns only unset keys', () => {
  assert.deepEqual(getMissingEnvVars({ DATABASE_URL: 'postgres://x' }, ['DATABASE_URL', 'REDIS_URL']), [
    'REDIS_URL',
  ]);
});

test('getAppSecretError rejects missing and placeholder secrets', () => {
  assert.match(getAppSecretError({}), /APP_SECRET is not defined/);
  assert.match(
    getAppSecretError({ APP_SECRET: 'replace-me-with-a-random-string' }),
    /default placeholder/,
  );
  assert.equal(getAppSecretError({ APP_SECRET: 'real-secret' }), null);
});

test('getTwoFactorEncryptionKeyError validates format only when set', () => {
  assert.equal(getTwoFactorEncryptionKeyError({}), null);
  assert.equal(getTwoFactorEncryptionKeyError({ TWO_FACTOR_ENCRYPTION_KEY: '' }), null);
  assert.match(
    getTwoFactorEncryptionKeyError({ TWO_FACTOR_ENCRYPTION_KEY: 'too-short' }),
    /64-character hex/,
  );
  assert.equal(
    getTwoFactorEncryptionKeyError({
      TWO_FACTOR_ENCRYPTION_KEY:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    }),
    null,
  );
});

test('collectEnvErrors requires database and app secret for local installs', () => {
  const errors = collectEnvErrors({});
  assert.ok(errors.some(error => error.includes('DATABASE_URL')));
  assert.ok(errors.some(error => error.includes('APP_SECRET')));
});

test('collectEnvErrors can skip app secret check for controlled environments', () => {
  const errors = collectEnvErrors({
    DATABASE_URL: 'postgresql://umami:umami@localhost:5432/umami',
    SKIP_APP_SECRET_CHECK: '1',
  });
  assert.deepEqual(errors, []);
});
