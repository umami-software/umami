import { expect, test } from 'vitest';
import { getSecurityKeyError } from './security-key';

test('maps a cancelled or timed out ceremony', () => {
  const error = Object.assign(new Error('The operation either timed out or was not allowed.'), {
    name: 'NotAllowedError',
  });

  expect(getSecurityKeyError(error)).toMatchObject({ code: 'security-key-error-cancelled' });
  expect(getSecurityKeyError({ code: 'ERROR_CEREMONY_ABORTED' })).toMatchObject({
    code: 'security-key-error-cancelled',
  });
});

test('maps a key that is already registered', () => {
  expect(getSecurityKeyError({ code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED' })).toMatchObject({
    code: 'security-key-error-already-registered',
  });
});

test('falls back to a generic verification error', () => {
  expect(getSecurityKeyError(new Error('Something else'))).toMatchObject({
    code: 'security-key-error-verification-failed',
    message: 'Something else',
  });
});
