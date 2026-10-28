import { create } from 'zustand';
import {
  APPEARANCE_CONFIG,
  type AppearanceSettings,
  DEFAULT_APPEARANCE,
  normalizeAppearance,
} from '@/lib/appearance';
import { getItem, setItem } from '@/lib/storage';

const store = create<{ settings: AppearanceSettings; preview: AppearanceSettings | null }>(() => ({
  settings: { ...DEFAULT_APPEARANCE },
  preview: null,
}));

/** Temporarily shows unsaved settings across the whole UI; pass null to revert. */
export function setAppearancePreview(preview: AppearanceSettings | null) {
  store.setState({ preview });
}

/** Reads the locally cached settings (client only). */
export function loadLocalAppearance(): AppearanceSettings {
  return normalizeAppearance(getItem(APPEARANCE_CONFIG));
}

export function setAppearance(settings: AppearanceSettings, persistLocal = true) {
  store.setState({ settings, preview: null });
  if (persistLocal) {
    setItem(APPEARANCE_CONFIG, settings);
  }
}

export const useAppearanceStore = store;
