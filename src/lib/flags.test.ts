import { evaluate } from 'flags/next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flags, getDefaultFlagValues, getFlagValues, isFeatureEnabled } from './flags';

vi.mock('flags/next', async importOriginal => ({
  ...(await importOriginal<typeof import('flags/next')>()),
  evaluate: vi.fn(),
}));

const mockedEvaluate = vi.mocked(evaluate);

beforeEach(() => {
  mockedEvaluate.mockReset();
});

describe('flags', () => {
  it('keys every flag by its own flag key', () => {
    for (const [key, definition] of Object.entries(flags)) {
      expect(definition.key).toBe(key);
    }
  });

  it('declares a default value for every flag', () => {
    for (const definition of Object.values(flags)) {
      expect(definition.defaultValue).not.toBeUndefined();
    }
  });
});

describe('isFeatureEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is off when FEATURE_FLAGS is not set', () => {
    vi.stubEnv('FEATURE_FLAGS', undefined);

    expect(isFeatureEnabled('commerce')).toBe(false);
  });

  it('is on when the key is listed', () => {
    vi.stubEnv('FEATURE_FLAGS', 'other,commerce');

    expect(isFeatureEnabled('commerce')).toBe(true);
  });

  it('ignores whitespace and case', () => {
    vi.stubEnv('FEATURE_FLAGS', ' other , Commerce ');

    expect(isFeatureEnabled('commerce')).toBe(true);
  });

  it('matches whole keys only', () => {
    vi.stubEnv('FEATURE_FLAGS', 'commerce-v2,ecommerce');

    expect(isFeatureEnabled('commerce')).toBe(false);
  });

  it('does not enable a flag for an empty key', () => {
    vi.stubEnv('FEATURE_FLAGS', 'commerce,');

    expect(isFeatureEnabled('')).toBe(false);
  });
});

describe('commerce flag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const decide = () => flags.commerce.decide({} as Parameters<typeof flags.commerce.decide>[0]);

  it('is off by default', () => {
    vi.stubEnv('FEATURE_FLAGS', undefined);

    expect(decide()).toBe(false);
  });

  it('is on when listed in FEATURE_FLAGS', () => {
    vi.stubEnv('FEATURE_FLAGS', 'commerce');

    expect(decide()).toBe(true);
  });
});

describe('getFlagValues', () => {
  it('returns the evaluated flag values', async () => {
    const values = { commerce: true };
    mockedEvaluate.mockResolvedValue(values);

    await expect(getFlagValues()).resolves.toEqual(values);
    expect(mockedEvaluate).toHaveBeenCalledWith(flags);
  });

  it('falls back to default values when evaluation fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedEvaluate.mockRejectedValue(new Error('flags: Missing FLAGS_SECRET'));

    await expect(getFlagValues()).resolves.toEqual(getDefaultFlagValues());
  });
});
