/**
 * Tests for the dial registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDialRegistry } from '../registry';
import type { DialConfig } from '../types';

describe('DialRegistry', () => {
  let registry: ReturnType<typeof getDialRegistry>;

  beforeEach(() => {
    // Get fresh registry instance
    registry = getDialRegistry();
    // Clear all registered dials
    registry.resetAll();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new dial with default value', () => {
      const config: DialConfig = {
        type: 'color',
        label: 'Test Color',
        default: '#ff0000',
        options: ['#ff0000', '#00ff00', '#0000ff'],
      };

      const value = registry.register('test-dial', 'color', config);

      expect(value).toBe('#ff0000');
    });

    it('should return existing value for already registered dial', () => {
      const config: DialConfig = {
        type: 'color',
        label: 'Test Color',
        default: '#ff0000',
        options: ['#ff0000', '#00ff00'],
      };

      const value1 = registry.register('test-dial', 'color', config);
      const value2 = registry.register('test-dial', 'color', config);

      expect(value1).toBe(value2);
    });
  });

  describe('setValue', () => {
    it('should set a new value and notify subscribers', () => {
      const config: DialConfig = {
        type: 'number',
        label: 'Test Number',
        default: 10,
        min: 0,
        max: 100,
      };

      registry.register('test-number', 'number', config);

      const callback = vi.fn();
      registry.subscribe('test-number', callback);

      registry.setValue('test-number', 50);

      expect(callback).toHaveBeenCalledWith('test-number', 50);
      expect(registry.getValue('test-number')).toBe(50);
    });

    it('should persist value to localStorage', () => {
      const config: DialConfig = {
        type: 'variant',
        label: 'Test Variant',
        default: 'option1',
        options: ['option1', 'option2', 'option3'],
      };

      registry.register('test-variant', 'variant', config);
      registry.setValue('test-variant', 'option2');

      const stored = localStorage.getItem('niteshift-dial-test-variant');
      expect(stored).toBe('"option2"');
    });
  });

  describe('reset', () => {
    it('should reset dial to default value', () => {
      const config: DialConfig = {
        type: 'boolean',
        label: 'Test Boolean',
        default: false,
      };

      registry.register('test-bool', 'boolean', config);
      registry.setValue('test-bool', true);

      expect(registry.getValue('test-bool')).toBe(true);

      registry.reset('test-bool');

      expect(registry.getValue('test-bool')).toBe(false);
    });

    it('should remove value from localStorage', () => {
      const config: DialConfig = {
        type: 'spacing',
        label: 'Test Spacing',
        default: '16px',
        options: ['8px', '16px', '24px'],
      };

      registry.register('test-spacing', 'spacing', config);
      registry.setValue('test-spacing', '24px');

      expect(localStorage.getItem('niteshift-dial-test-spacing')).toBeTruthy();

      registry.reset('test-spacing');

      expect(localStorage.getItem('niteshift-dial-test-spacing')).toBeNull();
    });
  });

  describe('resetAll', () => {
    it('should reset all dials to defaults', () => {
      registry.register('dial-1', 'color', {
        type: 'color',
        label: 'Color 1',
        default: '#ff0000',
      });
      registry.register('dial-2', 'number', {
        type: 'number',
        label: 'Number 1',
        default: 10,
      });

      registry.setValue('dial-1', '#00ff00');
      registry.setValue('dial-2', 50);

      registry.resetAll();

      expect(registry.getValue('dial-1')).toBe('#ff0000');
      expect(registry.getValue('dial-2')).toBe(10);
    });
  });

  describe('persistence', () => {
    it('should load value from localStorage on registration', () => {
      // Simulate existing localStorage value
      localStorage.setItem('niteshift-dial-persisted', '"custom-value"');

      const config: DialConfig = {
        type: 'variant',
        label: 'Persisted Dial',
        default: 'default-value',
        options: ['default-value', 'custom-value'],
      };

      const value = registry.register('persisted', 'variant', config);

      expect(value).toBe('custom-value');
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('niteshift-dial-corrupted', 'invalid-json{');

      const config: DialConfig = {
        type: 'color',
        label: 'Corrupted Dial',
        default: '#ff0000',
      };

      const value = registry.register('corrupted', 'color', config);

      // Should fall back to default
      expect(value).toBe('#ff0000');
    });
  });

  describe('subscriptions', () => {
    it('should notify multiple subscribers', () => {
      const config: DialConfig = {
        type: 'number',
        label: 'Test Number',
        default: 0,
      };

      registry.register('test-multi', 'number', config);

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      registry.subscribe('test-multi', callback1);
      registry.subscribe('test-multi', callback2);

      registry.setValue('test-multi', 100);

      expect(callback1).toHaveBeenCalledWith('test-multi', 100);
      expect(callback2).toHaveBeenCalledWith('test-multi', 100);
    });

    it('should unsubscribe correctly', () => {
      const config: DialConfig = {
        type: 'boolean',
        label: 'Test Boolean',
        default: false,
      };

      registry.register('test-unsub', 'boolean', config);

      const callback = vi.fn();
      const unsubscribe = registry.subscribe('test-unsub', callback);

      registry.setValue('test-unsub', true);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      registry.setValue('test-unsub', false);
      // Should still be 1 (not called again)
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
