import { evaluate, flag } from 'flags/next';

/**
 * Feature flags, declared with the Flags SDK (https://flags-sdk.dev).
 *
 * Server-side only. The object key is the flag key, so it matches the name shown in
 * the Vercel Flags Explorer and the key read on the client with `useFlag`.
 *
 * Every flag must have a `defaultValue` so the app keeps working if a flag cannot be evaluated.
 */
export const flags = {
  // Commerce UI only. Collection through /api/send and the commerce APIs are not gated.
  commerce: flag<boolean>({
    key: 'commerce',
    description: 'Show the Commerce report and commerce features in the UI. Set ENABLE_COMMERCE.',
    defaultValue: false,
    decide: () => !!process.env.ENABLE_COMMERCE,
  }),
};

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
