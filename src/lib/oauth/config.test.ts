import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { getOAuthEndpoints, isDynamicRegistrationEnabled, isOAuthEnabled } from './config';

function clearFeatureFlags() {
  delete process.env.MCP_ENABLED;
  delete process.env.OAUTH_DCR_ENABLED;
  delete process.env.DISABLE_LOGIN;
}

beforeEach(() => {
  clearFeatureFlags();
});

afterEach(() => {
  clearFeatureFlags();
});

describe('MCP feature gates', () => {
  test('keeps OAuth and MCP unavailable until explicitly enabled', () => {
    expect(isOAuthEnabled()).toBe(false);
    expect(isDynamicRegistrationEnabled()).toBe(false);
  });

  test('requires a separate opt-in for dynamic client registration', () => {
    process.env.MCP_ENABLED = '1';

    expect(isOAuthEnabled()).toBe(true);
    expect(isDynamicRegistrationEnabled()).toBe(false);
    expect(getOAuthEndpoints().registrationEndpoint).toBeUndefined();

    process.env.OAUTH_DCR_ENABLED = '1';

    expect(isDynamicRegistrationEnabled()).toBe(true);
    expect(getOAuthEndpoints().registrationEndpoint).toContain('/api/oauth/register');
  });

  test('does not enable OAuth when login is disabled', () => {
    process.env.MCP_ENABLED = '1';
    process.env.DISABLE_LOGIN = '1';

    expect(isOAuthEnabled()).toBe(false);
  });
});
