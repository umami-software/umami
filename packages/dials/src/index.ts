/**
 * Dials SDK - Runtime design parameter controls for rapid prototyping
 * @packageDocumentation
 */

// Core types
export type {
  DialType,
  DialConfig,
  ColorDialConfig,
  SpacingDialConfig,
  VariantDialConfig,
  BooleanDialConfig,
  NumberDialConfig,
  DialRegistration,
  DesignManifest,
} from './types';

// React hooks
export { useDynamicColor } from './hooks/useDynamicColor';
export { useDynamicSpacing } from './hooks/useDynamicSpacing';
export { useDynamicVariant } from './hooks/useDynamicVariant';
export { useDynamicBoolean } from './hooks/useDynamicBoolean';
export { useDynamicNumber } from './hooks/useDynamicNumber';

// Components
export { DialsProvider, useDialsContext } from './components/DialsProvider';
export { DialsOverlay } from './components/DialsOverlay';

// Registry (for advanced usage)
export { getDialRegistry } from './registry';

// Manifest utilities
export {
  loadManifest,
  getManifestColors,
  getManifestSpacing,
  getManifestTypography,
  getManifestBorderRadius,
  getManifestShadows,
  buildColorOptions,
} from './utils/manifest';
