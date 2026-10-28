import { describe, expect, test } from 'vitest';
import {
  APPEARANCE_PRESETS,
  DEFAULT_APPEARANCE,
  getAppearanceVars,
  normalizeAppearance,
} from './appearance';

describe('normalizeAppearance', () => {
  test('falls back to defaults for invalid input', () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(normalizeAppearance({ accent: 'red', blur: 500 })).toEqual(DEFAULT_APPEARANCE);
  });

  test('merges partial valid input', () => {
    expect(normalizeAppearance({ mode: 'dark' })).toEqual({ ...DEFAULT_APPEARANCE, mode: 'dark' });
  });
});

describe('getAppearanceVars', () => {
  test('keeps surfaces readable at maximum transparency', () => {
    const vars = getAppearanceVars({ ...DEFAULT_APPEARANCE, transparency: 100 });
    expect(Number(vars['--glass-alpha-user'])).toBeGreaterThanOrEqual(0.45);
  });

  test('picks a contrasting foreground for the accent', () => {
    expect(
      getAppearanceVars({ ...DEFAULT_APPEARANCE, accent: '#ffff00' })['--zen-primary-fg'],
    ).toBe('#0b1220');
    expect(
      getAppearanceVars({ ...DEFAULT_APPEARANCE, accent: '#1e3a8a' })['--zen-primary-fg'],
    ).toBe('#ffffff');
  });

  test('solid preset disables blur', () => {
    const solid = APPEARANCE_PRESETS.find(p => p.id === 'solid');
    expect(
      getAppearanceVars({ ...DEFAULT_APPEARANCE, ...solid, mode: 'light' })['--glass-blur'],
    ).toBe('0px');
  });
});
