/**
 * React hook for creating a boolean dial (toggle)
 */

import { useDial } from './useDial';
import type { BooleanDialConfig } from '../types';

/**
 * Create a dynamic boolean dial for toggles and feature flags
 *
 * @example
 * ```typescript
 * const showMetrics = useDynamicBoolean('show-metrics', {
 *   label: 'Show Metrics',
 *   default: true,
 *   trueLabel: 'Visible',
 *   falseLabel: 'Hidden',
 *   group: 'Dashboard'
 * });
 *
 * {showMetrics && <MetricsPanel />}
 * ```
 */
export function useDynamicBoolean(id: string, config: Omit<BooleanDialConfig, 'type'>): boolean {
  return useDial<boolean>(id, 'boolean', { ...config, type: 'boolean' });
}
