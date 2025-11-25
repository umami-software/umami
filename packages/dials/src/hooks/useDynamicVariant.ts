/**
 * React hook for creating a variant dial
 */

import { useDial } from './useDial';
import type { VariantDialConfig } from '../types';

/**
 * Create a dynamic variant dial for discrete choices
 *
 * @example
 * ```typescript
 * const layout = useDynamicVariant('dashboard-layout', {
 *   label: 'Layout Style',
 *   default: 'grid',
 *   options: ['grid', 'list', 'compact'] as const,
 *   group: 'Dashboard'
 * });
 *
 * {layout === 'grid' && <GridView />}
 * {layout === 'list' && <ListView />}
 * ```
 */
export function useDynamicVariant<T extends string>(
  id: string,
  config: Omit<VariantDialConfig<T>, 'type'>,
): T {
  return useDial<T>(id, 'variant', { ...config, type: 'variant' });
}
