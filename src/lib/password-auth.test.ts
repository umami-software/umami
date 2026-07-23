import { afterEach, expect, test } from 'vitest';
import { isPasswordAuthDisabled } from './password-auth';

const originalDisableLogin = process.env.DISABLE_LOGIN;
const originalCloudMode = process.env.CLOUD_MODE;

afterEach(() => {
  if (originalDisableLogin === undefined) {
    delete process.env.DISABLE_LOGIN;
  } else {
    process.env.DISABLE_LOGIN = originalDisableLogin;
  }

  if (originalCloudMode === undefined) {
    delete process.env.CLOUD_MODE;
  } else {
    process.env.CLOUD_MODE = originalCloudMode;
  }
});

test('allows password authentication by default', () => {
  delete process.env.DISABLE_LOGIN;
  delete process.env.CLOUD_MODE;

  expect(isPasswordAuthDisabled()).toBe(false);
});

test.each([
  'DISABLE_LOGIN',
  'CLOUD_MODE',
] as const)('disables password authentication when %s is configured', variable => {
  delete process.env.DISABLE_LOGIN;
  delete process.env.CLOUD_MODE;
  process.env[variable] = '1';

  expect(isPasswordAuthDisabled()).toBe(true);
});
