/**
 * React hook for creating a color dial
 */

import { useDial } from './useDial';
import { useDialsContext } from '../components/DialsProvider';
import type { ColorDialConfig } from '../types';

/**
 * Create a dynamic color dial
 *
 * When options are not provided, automatically pulls color values from the
 * design manifest (if available). Supports manifest categories like 'primary',
 * 'accent', 'semantic', etc.
 *
 * @example
 * ```typescript
 * // With explicit options:
 * const bgColor = useDynamicColor('hero-bg', {
 *   label: 'Background Color',
 *   default: '#1a1a1a',
 *   options: ['#1a1a1a', '#2d2d2d', '#404040'],
 *   group: 'Hero Section'
 * });
 *
 * // With manifest defaults (auto-populated from designManifest.colors.accent):
 * const accentColor = useDynamicColor('accent', {
 *   label: 'Accent Color',
 *   default: '#3e63dd',
 *   manifestCategory: 'accent', // pulls from manifest
 * });
 * ```
 */
export function useDynamicColor(id: string, config: Omit<ColorDialConfig, 'type'>): string {
  const { manifest } = useDialsContext();

  // Build config with optional manifest defaults
  const finalConfig: ColorDialConfig = { ...config, type: 'color' as const };

  // If options not provided and we have a manifest, try to load from manifest
  if (!config.options && manifest?.colors) {
    const category = (config as any).manifestCategory || 'accent';
    const colorCategory = manifest.colors[category];

    if (colorCategory?.values) {
      const values = colorCategory.values;
      finalConfig.options = Array.isArray(values) ? values : Object.values(values);
    }
  }

  return useDial<string>(id, 'color', finalConfig);
}
