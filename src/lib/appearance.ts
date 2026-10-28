import { z } from 'zod';

export const APPEARANCE_CONFIG = 'umami.appearance';

export type AppearanceMode = 'light' | 'dark' | 'system';

export interface AppearanceSettings {
  mode: AppearanceMode;
  preset: string;
  accent: string; // hex color, e.g. #3b82f6
  transparency: number; // 0-100
  blur: number; // 0-100
  shadow: number; // 0-100
}

export interface AppearancePreset {
  id: string;
  label: string;
  accent: string;
  transparency: number;
  blur: number;
  shadow: number;
}

export const APPEARANCE_PRESETS: AppearancePreset[] = [
  {
    id: 'liquid',
    label: 'Liquid glass',
    accent: '#3b82f6',
    transparency: 60,
    blur: 60,
    shadow: 55,
  },
  { id: 'calm', label: 'Calm', accent: '#6366f1', transparency: 30, blur: 30, shadow: 25 },
  { id: 'crystal', label: 'Crystal', accent: '#06b6d4', transparency: 80, blur: 85, shadow: 70 },
  {
    id: 'solid',
    label: 'Solid (no glass)',
    accent: '#3b82f6',
    transparency: 0,
    blur: 0,
    shadow: 20,
  },
];

export const ACCENT_SWATCHES = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
];

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  mode: 'system',
  preset: 'liquid',
  accent: '#3b82f6',
  transparency: 60,
  blur: 60,
  shadow: 55,
};

export const appearanceSchema = z.object({
  mode: z.enum(['light', 'dark', 'system']),
  preset: z.string().max(40),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  transparency: z.number().int().min(0).max(100),
  blur: z.number().int().min(0).max(100),
  shadow: z.number().int().min(0).max(100),
});

export function normalizeAppearance(value: unknown): AppearanceSettings {
  const parsed = appearanceSchema.safeParse({ ...DEFAULT_APPEARANCE, ...(value as object) });
  return parsed.success ? (parsed.data as AppearanceSettings) : { ...DEFAULT_APPEARANCE };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]) {
  const c = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** CSS custom properties consumed by src/app/glass.css (all derived from the 0-100 sliders). */
export function getAppearanceVars(s: AppearanceSettings): Record<string, string> {
  const rgb = hexToRgb(s.accent);
  const fg = luminance(rgb) > 0.4 ? '#0b1220' : '#ffffff';
  const t = s.transparency / 100;

  return {
    '--zen-primary': s.accent,
    '--zen-primary-fg': fg,
    '--glass-accent-rgb': rgb.join(' '),
    // Higher "transparency" => lower surface opacity, but never below a readable floor.
    '--glass-alpha-user': String(+(0.92 - t * 0.45).toFixed(3)),
    '--glass-blur': `${Math.round((s.blur / 100) * 28)}px`,
    '--glass-shadow-alpha': String(+((s.shadow / 100) * 0.22).toFixed(3)),
    '--glass-shadow-blur': `${Math.round(8 + (s.shadow / 100) * 40)}px`,
  };
}

const VAR_KEYS = Object.keys(getAppearanceVars(DEFAULT_APPEARANCE));

export function applyAppearance(
  s: AppearanceSettings,
  root: HTMLElement = document.documentElement,
) {
  const vars = getAppearanceVars(s);
  for (const key of VAR_KEYS) {
    root.style.setProperty(key, vars[key]);
  }
  root.dataset.glass = s.blur > 0 || s.transparency > 0 ? 'on' : 'off';
}
