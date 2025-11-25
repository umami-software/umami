/**
 * Core type definitions for the Dials SDK
 */

export type DialType = 'color' | 'spacing' | 'variant' | 'boolean' | 'number';

/**
 * Base configuration shared by all dial types
 */
export interface BaseDialConfig<T> {
  /** Human-readable label for the dial */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Group/category for organization in overlay UI */
  group?: string;
  /** Default value */
  default: T;
}

/**
 * Color dial configuration
 * For any color value (backgrounds, text, borders, etc.)
 */
export interface ColorDialConfig extends BaseDialConfig<string> {
  type?: 'color';
  /** Predefined color options (from design system) */
  options?: string[];
  /** Allow custom hex input */
  allowCustom?: boolean;
  /** Color format hint */
  format?: 'hex' | 'rgb' | 'hsl' | 'var';
}

/**
 * Spacing dial configuration
 * For padding, margin, gap, width, height, etc.
 */
export interface SpacingDialConfig extends BaseDialConfig<string> {
  type?: 'spacing';
  /** Predefined spacing options (e.g., '4px', '8px', 'var(--spacing-3)') */
  options?: string[];
  /** Allow custom values */
  allowCustom?: boolean;
  /** Unit for custom values */
  unit?: 'px' | 'rem' | 'em' | '%';
  /** Min value for custom input */
  min?: number;
  /** Max value for custom input */
  max?: number;
}

/**
 * Variant dial configuration
 * For discrete choices (layouts, styles, chart types, etc.)
 */
export interface VariantDialConfig<T extends string = string> extends BaseDialConfig<T> {
  type?: 'variant';
  /** Array of allowed values (enum-like) */
  options: readonly T[];
  /** Optional labels for each option (if different from value) */
  optionLabels?: Record<T, string>;
}

/**
 * Boolean dial configuration
 * For toggles, feature flags, show/hide, etc.
 */
export interface BooleanDialConfig extends BaseDialConfig<boolean> {
  type?: 'boolean';
  /** Label for "true" state */
  trueLabel?: string;
  /** Label for "false" state */
  falseLabel?: string;
}

/**
 * Number dial configuration
 * For numeric values with constraints
 */
export interface NumberDialConfig extends BaseDialConfig<number> {
  type?: 'number';
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Unit to display (e.g., 'px', '%', 'ms') */
  unit?: string;
  /** Predefined number options */
  options?: number[];
}

/**
 * Union type for all dial configurations
 */
export type DialConfig =
  | ColorDialConfig
  | SpacingDialConfig
  | VariantDialConfig<any>
  | BooleanDialConfig
  | NumberDialConfig;

/**
 * Internal dial registration stored in registry
 */
export interface DialRegistration {
  /** Unique identifier for the dial */
  id: string;
  /** Type of dial */
  type: DialType;
  /** Configuration */
  config: DialConfig;
  /** Current value (user override or default) */
  currentValue: any;
  /** Timestamp of last update */
  updatedAt?: number;
}

/**
 * Design system manifest structure
 */
export interface DesignManifest {
  name?: string;
  version?: string;
  colors?: {
    [category: string]: {
      label?: string;
      values: string[] | Record<string, string>;
    };
  };
  spacing?: {
    label?: string;
    values: string[];
    variables?: string[];
  };
  typography?: {
    fontFamilies?: {
      label?: string;
      values: string[];
    };
    fontSizes?: {
      label?: string;
      values: string[];
      variables?: string[];
    };
    fontWeights?: {
      label?: string;
      values: string[];
      labels?: string[];
    };
    headingSizes?: {
      label?: string;
      values: string[];
      variables?: string[];
    };
  };
  borderRadius?: {
    label?: string;
    values: string[];
    variables?: string[];
    labels?: string[];
  };
  shadows?: {
    label?: string;
    values: string[];
    variables?: string[];
    labels?: string[];
  };
  [key: string]: any;
}

/**
 * Event types for dial changes
 */
export type DialChangeListener = (id: string, value: any) => void;
export type DialRegistryListener = () => void;
