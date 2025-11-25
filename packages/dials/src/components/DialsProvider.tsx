/**
 * React context provider for dials
 * Provides access to the design manifest and configuration
 */

import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { getDialRegistry } from '../registry';
import type { DesignManifest } from '../types';

interface DialsContextValue {
  manifest: DesignManifest | null;
}

const DialsContext = createContext<DialsContextValue>({
  manifest: null,
});

export interface DialsProviderProps {
  children: ReactNode;
  /** Design system manifest (imported from config) */
  manifest?: DesignManifest | null;
  /** Optional project ID for scoping localStorage */
  projectId?: string;
}

/**
 * Provider component for dials
 * Should wrap your app at the root level
 *
 * @example
 * ```typescript
 * import { designManifest } from '@/config/niteshift-manifest';
 *
 * <DialsProvider manifest={designManifest}>
 *   <App />
 *   <DialsOverlay />
 * </DialsProvider>
 * ```
 */
export function DialsProvider({ children, manifest = null, projectId }: DialsProviderProps) {
  useEffect(() => {
    // Set project ID if provided
    if (projectId) {
      const registry = getDialRegistry();
      registry.setProjectId(projectId);
    }
  }, [projectId]);

  return <DialsContext.Provider value={{ manifest }}>{children}</DialsContext.Provider>;
}

/**
 * Hook to access the dials context
 * @returns The dials context value (manifest)
 */
export function useDialsContext(): DialsContextValue {
  return useContext(DialsContext);
}
