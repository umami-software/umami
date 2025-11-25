/**
 * Global dial registry - singleton that manages all dials
 * Survives hot reloads by using a singleton pattern
 * Persists values to localStorage
 */

import type {
  DialType,
  DialConfig,
  DialRegistration,
  DialChangeListener,
  DialRegistryListener,
} from './types';

const STORAGE_KEY_PREFIX = 'niteshift-dials';
const STORAGE_VERSION = '1';

/**
 * Get the storage key for persisting dial values
 * Can be scoped by project ID in the future
 */
function getStorageKey(projectId?: string): string {
  return projectId
    ? `${STORAGE_KEY_PREFIX}-${projectId}-v${STORAGE_VERSION}`
    : `${STORAGE_KEY_PREFIX}-v${STORAGE_VERSION}`;
}

/**
 * Singleton registry for all dials
 */
class DialRegistry {
  private static instance: DialRegistry | null = null;

  /** All registered dials */
  private dials = new Map<string, DialRegistration>();

  /** Listeners for specific dial changes */
  private changeListeners = new Map<string, Set<DialChangeListener>>();

  /** Listeners for any registry change (for overlay UI) */
  private registryListeners = new Set<DialRegistryListener>();

  /** Project ID for storage scoping */
  private projectId?: string;

  private constructor() {
    // Load persisted values on initialization
    this.loadFromStorage();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): DialRegistry {
    if (!DialRegistry.instance) {
      DialRegistry.instance = new DialRegistry();
    }
    return DialRegistry.instance;
  }

  /**
   * Set the project ID for storage scoping
   */
  setProjectId(projectId: string): void {
    this.projectId = projectId;
    this.loadFromStorage();
  }

  /**
   * Register a new dial or get existing value
   * Returns the current value (persisted or default)
   */
  register<T>(id: string, type: DialType, config: DialConfig): T {
    // If already registered, return current value
    if (this.dials.has(id)) {
      return this.dials.get(id)!.currentValue as T;
    }

    // Check for persisted value
    const persistedValue = this.getPersistedValue(id);
    const currentValue = persistedValue !== null ? persistedValue : config.default;

    const registration: DialRegistration = {
      id,
      type,
      config,
      currentValue,
      updatedAt: Date.now(),
    };

    this.dials.set(id, registration);
    this.notifyRegistryListeners();

    return currentValue as T;
  }

  /**
   * Update a dial's value
   */
  setValue(id: string, value: any): void {
    const dial = this.dials.get(id);
    if (!dial) {
      // eslint-disable-next-line no-console
      console.warn(`[Dials] Attempted to set value for unregistered dial: ${id}`);
      return;
    }

    dial.currentValue = value;
    dial.updatedAt = Date.now();

    this.persistValue(id, value);
    this.notifyChangeListeners(id, value);
    this.notifyRegistryListeners();
  }

  /**
   * Get a dial's current value
   */
  getValue(id: string): any {
    return this.dials.get(id)?.currentValue;
  }

  /**
   * Get a dial's registration
   */
  getDial(id: string): DialRegistration | undefined {
    return this.dials.get(id);
  }

  /**
   * Get all registered dials
   */
  getAllDials(): DialRegistration[] {
    return Array.from(this.dials.values());
  }

  /**
   * Get dials by group
   */
  getDialsByGroup(): Map<string, DialRegistration[]> {
    const groups = new Map<string, DialRegistration[]>();

    for (const dial of this.dials.values()) {
      const group = dial.config.group || 'Ungrouped';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(dial);
    }

    return groups;
  }

  /**
   * Reset a dial to its default value
   */
  reset(id: string): void {
    const dial = this.dials.get(id);
    if (!dial) return;

    this.setValue(id, dial.config.default);
  }

  /**
   * Reset all dials to their default values
   */
  resetAll(): void {
    for (const [id] of this.dials) {
      this.reset(id);
    }
  }

  /**
   * Subscribe to changes for a specific dial
   */
  subscribe(id: string, listener: DialChangeListener): () => void {
    if (!this.changeListeners.has(id)) {
      this.changeListeners.set(id, new Set());
    }
    this.changeListeners.get(id)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.changeListeners.get(id)?.delete(listener);
    };
  }

  /**
   * Subscribe to any registry change (for overlay UI)
   */
  subscribeToRegistry(listener: DialRegistryListener): () => void {
    this.registryListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.registryListeners.delete(listener);
    };
  }

  /**
   * Notify listeners of a dial value change
   */
  private notifyChangeListeners(id: string, value: any): void {
    const listeners = this.changeListeners.get(id);
    if (listeners) {
      listeners.forEach(listener => listener(id, value));
    }
  }

  /**
   * Notify registry listeners (for overlay UI updates)
   * Deferred to avoid React "setState during render" errors
   */
  private notifyRegistryListeners(): void {
    queueMicrotask(() => {
      this.registryListeners.forEach(listener => listener());
    });
  }

  /**
   * Load persisted values from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const key = getStorageKey(this.projectId);
      const stored = localStorage.getItem(key);
      if (stored) {
        JSON.parse(stored); // Validate JSON, values will be applied when dials are registered
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Dials] Failed to load from localStorage:', error);
    }
  }

  /**
   * Get a persisted value for a dial
   */
  private getPersistedValue(id: string): any | null {
    if (typeof window === 'undefined') return null;

    try {
      const key = getStorageKey(this.projectId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        return data[id] !== undefined ? data[id] : null;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Dials] Failed to get persisted value:', error);
    }

    return null;
  }

  /**
   * Persist a dial value to localStorage
   */
  private persistValue(id: string, value: any): void {
    if (typeof window === 'undefined') return;

    try {
      const key = getStorageKey(this.projectId);
      const stored = localStorage.getItem(key);
      const data = stored ? JSON.parse(stored) : {};

      data[id] = value;

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Dials] Failed to persist value:', error);
    }
  }

  /**
   * Export all current values as an object
   */
  exportValues(): Record<string, any> {
    const values: Record<string, any> = {};
    for (const [id, dial] of this.dials) {
      values[id] = dial.currentValue;
    }
    return values;
  }

  /**
   * Export all dials with their configurations
   */
  exportDials(): DialRegistration[] {
    return this.getAllDials();
  }

  /**
   * Clear all persisted values
   */
  clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const key = getStorageKey(this.projectId);
      localStorage.removeItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Dials] Failed to clear storage:', error);
    }
  }
}

// Export singleton instance getter
export const getDialRegistry = () => DialRegistry.getInstance();
