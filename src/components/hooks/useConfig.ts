import { createContext, useContext } from 'react';
import type { Config } from '@/lib/config';

export type { Config };

export const ConfigContext = createContext<Config | null>(null);

export function useConfig(): Config {
  return useContext(ConfigContext);
}
