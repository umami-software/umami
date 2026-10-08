import { evaluate, type flag } from 'flags/next';

/**
 * Whether a flag key is listed in FEATURE_FLAGS, a comma-separated list of enabled flags,
 * e.g. `FEATURE_FLAGS=example,other`. Whitespace and case are ignored.
 */
export function isFeatureEnabled(key: string): boolean {
  return (process.env.FEATURE_FLAGS ?? '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(key.toLowerCase());
}

/**
 * Feature flags, declared with the Flags SDK (https://flags-sdk.dev).
 *
 * Server-side only. The object key is the flag key, so it matches the name shown in
 * the Vercel Flags Explorer, the key read on the client with `useFlag`, and the value
 * listed in FEATURE_FLAGS.
 *
 * Every flag must have a `defaultValue` so the app keeps working if a flag cannot be evaluated.
 */
export const flags: Record<string, ReturnType<typeof flag<boolean>>> = {};

export type FlagKey = keyof typeof flags;

export type FlagValues = {
  [K in FlagKey]: Awaited<ReturnType<(typeof flags)[K]>>;
};

export function getDefaultFlagValues(): FlagValues {
  return Object.fromEntries(
    Object.entries(flags).map(([key, definition]) => [key, definition.defaultValue]),
  ) as FlagValues;
}

/**
 * Evaluates every flag for the current request, respecting Flags Explorer overrides.
 * Falls back to default values rather than failing the page, for example when an
 * override cookie is present but FLAGS_SECRET is not set.
 */
export async function getFlagValues(): Promise<FlagValues> {
  try {
    return (await evaluate(flags)) as FlagValues;
  } catch (error) {
    console.error('Failed to evaluate feature flags, using defaults.', error);
    return getDefaultFlagValues();
  }
}
