/**
 * React hook for creating a spacing dial
 */

import { useDial } from './useDial';
import { useDialsContext } from '../components/DialsProvider';
import type { SpacingDialConfig } from '../types';

/**
 * Create a dynamic spacing dial
 *
 * When options are not provided, automatically pulls spacing values from the
 * design manifest's spacing scale (if available).
 *
 * @example
 * ```typescript
 * // With explicit options:
 * const padding = useDynamicSpacing('card-padding', {
 *   label: 'Card Padding',
 *   default: '1rem',
 *   options: ['0.5rem', '1rem', '1.5rem', '2rem'],
 *   group: 'Card'
 * });
 *
 * // With manifest defaults (auto-populated from designManifest.spacing):
 * const margin = useDynamicSpacing('section-margin', {
 *   label: 'Section Margin',
 *   default: '24px', // pulls options from manifest.spacing.values
 * });
 * ```
 */
export function useDynamicSpacing(id: string, config: Omit<SpacingDialConfig, 'type'>): string {
  const { manifest } = useDialsContext();

  // Build config with optional manifest defaults
  const finalConfig: SpacingDialConfig = { ...config, type: 'spacing' as const };

  // If options not provided and we have a manifest, load from manifest spacing
  if (!config.options && manifest?.spacing?.values) {
    finalConfig.options = manifest.spacing.values;
  }

  return useDial<string>(id, 'spacing', finalConfig);
}
