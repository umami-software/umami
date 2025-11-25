/**
 * Core React hook for creating a dynamic dial
 * This is the base hook that all specific dial hooks use internally
 */

import { useState, useEffect } from 'react';
import { getDialRegistry } from '../registry';
import type { DialType, DialConfig } from '../types';

/**
 * Core hook for creating a dial
 * Registers the dial in the global registry and subscribes to changes
 *
 * @param id - Unique identifier for this dial
 * @param type - Type of dial
 * @param config - Configuration for the dial
 * @returns Current value of the dial
 */
export function useDial<T>(id: string, type: DialType, config: DialConfig): T {
  const registry = getDialRegistry();

  // Register the dial and get initial value
  const [value, setValue] = useState<T>(() => registry.register<T>(id, type, config));

  useEffect(() => {
    // Subscribe to changes for this specific dial
    const unsubscribe = registry.subscribe(id, (dialId, newValue) => {
      setValue(newValue);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [id, registry]);

  return value;
}
