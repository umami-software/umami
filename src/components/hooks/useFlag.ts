import { createContext, useContext } from 'react';
import type { FlagKey, FlagValues } from '@/lib/flags';

export type { FlagKey, FlagValues };

export const FlagsContext = createContext<FlagValues | null>(null);

/**
 * Reads a feature flag value evaluated on the server for the current request.
 */
export function useFlag<K extends FlagKey>(key: K): FlagValues[K] {
  const flags = useContext(FlagsContext);

  if (!flags) {
    throw new Error('useFlag must be used within a FlagsContext provider.');
  }

  return flags[key];
}
