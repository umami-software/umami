import { describe, expect, test } from 'vitest';
import { getColor, getThemeColors, hex2RGB, hex6, rgb2Hex } from './colors';

describe('hex6', () => {
  test('is deterministic for the same input', () => {
    expect(hex6('umami')).toBe(hex6('umami'));
  });

  test('returns a 6-character hex string', () => {
    expect(hex6('anything')).toMatch(/^[0-9a-f]{6}$/);
  });

  test('produces different hashes for different inputs', () => {
    expect(hex6('a')).not.toBe(hex6('b'));
  });
});

describe('hex2RGB', () => {
  test('converts a hex color to RGB channels', () => {
    expect(hex2RGB('#2680eb')).toEqual({ r: 0x26, g: 0x80, b: 0xeb });
  });

  test('works without a leading hash', () => {
    expect(hex2RGB('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hex2RGB('000000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('rgb2Hex', () => {
  test('joins channels into a hex string', () => {
    expect(rgb2Hex(0x26, 0x80, 0xeb)).toBe('2680eb');
  });

  test('applies the given prefix', () => {
    expect(rgb2Hex(0xff, 0xff, 0xff, '#')).toBe('#ffffff');
  });

  test('round-trips with hex2RGB for full-byte channels', () => {
    const hex = '2680eb';
    const { r, g, b } = hex2RGB(hex);
    expect(rgb2Hex(r, g, b)).toBe(hex);
  });
});

describe('getColor', () => {
  test('is deterministic for the same seed', () => {
    expect(getColor('umami')).toBe(getColor('umami'));
  });

  test('produces different colors for different seeds', () => {
    expect(getColor('a')).not.toBe(getColor('b'));
  });
});

describe('getThemeColors', () => {
  test('builds a color structure for the light theme', () => {
    const result = getThemeColors('light');

    expect(result.colors.theme).toMatchObject({ primary: '#2680eb' });
    expect(result.colors.map.baseColor).toBe('#2680eb');
    expect(result.colors.chart.views.backgroundColor).toContain('rgba');
    expect(result.colors.chart.text).toBeDefined();
  });

  test('builds a color structure for the dark theme', () => {
    const result = getThemeColors('dark');
    expect(result.colors.theme).toMatchObject({ fill: '#191919' });
  });
});
