/**
 * Tests for useDynamicColor hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDynamicColor } from '../hooks/useDynamicColor';
import { getDialRegistry } from '../registry';
import { DialsProvider } from '../components/DialsProvider';
import type { DesignManifest } from '../types';

// Wrapper with DialsProvider
function createWrapper(manifest?: DesignManifest | null) {
  return ({ children }: { children: React.ReactNode }) => (
    <DialsProvider manifest={manifest}>{children}</DialsProvider>
  );
}

describe('useDynamicColor', () => {
  let registry: ReturnType<typeof getDialRegistry>;

  beforeEach(() => {
    registry = getDialRegistry();
    registry.resetAll();
    localStorage.clear();
  });

  it('should return default color value', () => {
    const { result } = renderHook(
      () =>
        useDynamicColor('test-color', {
          label: 'Test Color',
          default: '#ff0000',
          options: ['#ff0000', '#00ff00', '#0000ff'],
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current).toBe('#ff0000');
  });

  it('should update when registry value changes', () => {
    const { result } = renderHook(
      () =>
        useDynamicColor('reactive-color', {
          label: 'Reactive Color',
          default: '#ff0000',
          options: ['#ff0000', '#00ff00', '#0000ff'],
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current).toBe('#ff0000');

    // Update via registry
    act(() => {
      registry.setValue('reactive-color', '#00ff00');
    });

    expect(result.current).toBe('#00ff00');
  });

  it('should use manifest defaults when options not provided', () => {
    const manifest: DesignManifest = {
      name: 'Test Manifest',
      version: '1.0.0',
      colors: {
        accent: {
          label: 'Accent Colors',
          values: {
            blue: '#0090ff',
            green: '#30a46c',
            red: '#e5484d',
          },
        },
      },
    };

    const { result } = renderHook(
      () =>
        useDynamicColor('manifest-color', {
          label: 'Manifest Color',
          default: '#0090ff',
          // No options - should use manifest
        }),
      { wrapper: createWrapper(manifest) },
    );

    expect(result.current).toBe('#0090ff');

    // Verify the dial was registered with manifest options
    const dial = registry.getAllDials().find(d => d.id === 'manifest-color');
    expect(dial?.config.options).toEqual(['#0090ff', '#30a46c', '#e5484d']);
  });

  it('should prefer explicit options over manifest', () => {
    const manifest: DesignManifest = {
      name: 'Test Manifest',
      version: '1.0.0',
      colors: {
        accent: {
          label: 'Accent Colors',
          values: ['#0090ff', '#30a46c'],
        },
      },
    };

    const explicitOptions = ['#ff0000', '#00ff00'];

    const { result } = renderHook(
      () =>
        useDynamicColor('explicit-color', {
          label: 'Explicit Color',
          default: '#ff0000',
          options: explicitOptions,
        }),
      { wrapper: createWrapper(manifest) },
    );

    const dial = registry.getAllDials().find(d => d.id === 'explicit-color');
    expect(dial?.config.options).toEqual(explicitOptions);
  });

  it('should handle manifest category selection', () => {
    const manifest: DesignManifest = {
      name: 'Test Manifest',
      version: '1.0.0',
      colors: {
        primary: {
          label: 'Primary Colors',
          values: ['#147af3', '#2680eb'],
        },
        accent: {
          label: 'Accent Colors',
          values: ['#0090ff', '#30a46c'],
        },
      },
    };

    const { result } = renderHook(
      () =>
        useDynamicColor('primary-color', {
          label: 'Primary Color',
          default: '#147af3',
          manifestCategory: 'primary',
        } as any), // manifestCategory is not in type yet, but handled in implementation
      { wrapper: createWrapper(manifest) },
    );

    const dial = registry.getAllDials().find(d => d.id === 'primary-color');
    expect(dial?.config.options).toEqual(['#147af3', '#2680eb']);
  });
});
