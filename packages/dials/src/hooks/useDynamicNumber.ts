/**
 * React hook for creating a number dial
 */

import { useDial } from './useDial';
import type { NumberDialConfig } from '../types';

/**
 * Create a dynamic number dial
 *
 * @example
 * ```typescript
 * const chartHeight = useDynamicNumber('chart-height', {
 *   label: 'Chart Height',
 *   default: 400,
 *   min: 200,
 *   max: 800,
 *   step: 50,
 *   unit: 'px',
 *   group: 'Chart'
 * });
 *
 * <Chart height={chartHeight} />
 * ```
 */
export function useDynamicNumber(id: string, config: Omit<NumberDialConfig, 'type'>): number {
  return useDial<number>(id, 'number', { ...config, type: 'number' });
}
