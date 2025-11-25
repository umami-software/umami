/**
 * Utilities for loading and working with the design system manifest
 */

import type { DesignManifest } from '../types';

let cachedManifest: DesignManifest | null = null;

/**
 * Load the design system manifest from .niteshift-manifest
 * Caches the result for subsequent calls
 */
export async function loadManifest(
  manifestPath = '/.niteshift-manifest',
): Promise<DesignManifest | null> {
  // Return cached manifest if available
  if (cachedManifest) {
    return cachedManifest;
  }

  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn('[Dials] Design manifest not found at', manifestPath);
      return null;
    }

    const manifest = await response.json();
    cachedManifest = manifest;
    return manifest;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Dials] Failed to load design manifest:', error);
    return null;
  }
}

/**
 * Get color options from the manifest
 * @param category - Optional category (e.g., 'primary', 'accent', 'semantic')
 * @returns Array of color values
 */
export function getManifestColors(manifest: DesignManifest, category?: string): string[] {
  if (!manifest.colors) return [];

  if (category && manifest.colors[category]) {
    const cat = manifest.colors[category];
    if (Array.isArray(cat.values)) {
      return cat.values;
    } else if (typeof cat.values === 'object') {
      return Object.values(cat.values);
    }
  }

  // Return all colors if no category specified
  const allColors: string[] = [];
  for (const cat of Object.values(manifest.colors)) {
    if (Array.isArray(cat.values)) {
      allColors.push(...cat.values);
    } else if (typeof cat.values === 'object') {
      allColors.push(...Object.values(cat.values));
    }
  }

  return allColors;
}

/**
 * Get spacing options from the manifest
 * @param useVariables - If true, returns CSS variable names instead of pixel values
 * @returns Array of spacing values
 */
export function getManifestSpacing(manifest: DesignManifest, useVariables = false): string[] {
  if (!manifest.spacing) return [];

  if (useVariables && manifest.spacing.variables) {
    return manifest.spacing.variables;
  }

  return manifest.spacing.values || [];
}

/**
 * Get typography options from the manifest
 */
export function getManifestTypography(
  manifest: DesignManifest,
  type: 'fontFamilies' | 'fontSizes' | 'fontWeights' | 'headingSizes',
  useVariables = false,
): string[] {
  if (!manifest.typography || !manifest.typography[type]) return [];

  const config = manifest.typography[type];

  if (useVariables && 'variables' in config && config.variables) {
    return config.variables;
  }

  return config.values || [];
}

/**
 * Get border radius options from the manifest
 */
export function getManifestBorderRadius(manifest: DesignManifest, useVariables = false): string[] {
  if (!manifest.borderRadius) return [];

  if (useVariables && manifest.borderRadius.variables) {
    return manifest.borderRadius.variables;
  }

  return manifest.borderRadius.values || [];
}

/**
 * Get shadow options from the manifest
 */
export function getManifestShadows(manifest: DesignManifest, useVariables = false): string[] {
  if (!manifest.shadows) return [];

  if (useVariables && manifest.shadows.variables) {
    return manifest.shadows.variables;
  }

  return manifest.shadows.values || [];
}

/**
 * Helper to build color options with categories
 * Returns a flat array with all colors from specified categories
 */
export function buildColorOptions(manifest: DesignManifest, categories: string[]): string[] {
  const colors: string[] = [];

  for (const category of categories) {
    const categoryColors = getManifestColors(manifest, category);
    colors.push(...categoryColors);
  }

  return colors;
}

/**
 * Invalidate the cached manifest (useful for hot reload scenarios)
 */
export function invalidateManifestCache(): void {
  cachedManifest = null;
}
