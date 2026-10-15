import { describe, expect, test } from 'vitest';
import { getRecorderConfig, getRecorderEnabled } from './recorder';

describe('getRecorderConfig', () => {
  test('returns an empty object for non-object values', () => {
    expect(getRecorderConfig(null)).toEqual({});
    expect(getRecorderConfig(undefined)).toEqual({});
    expect(getRecorderConfig('x')).toEqual({});
    expect(getRecorderConfig([1, 2])).toEqual({});
  });

  test('only keeps boolean enabled flags that are strictly true', () => {
    expect(getRecorderConfig({ replayEnabled: true, heatmapEnabled: false })).toEqual({
      replayEnabled: true,
    });
    expect(getRecorderConfig({ replayEnabled: 'true' })).toEqual({});
  });

  test('keeps numeric sample rates', () => {
    expect(getRecorderConfig({ sampleRate: 0.5, heatmapSampleRate: 1 })).toEqual({
      sampleRate: 0.5,
      heatmapSampleRate: 1,
    });
    expect(getRecorderConfig({ sampleRate: '0.5' })).toEqual({});
  });

  test('only accepts known mask levels', () => {
    expect(getRecorderConfig({ maskLevel: 'strict' })).toEqual({ maskLevel: 'strict' });
    expect(getRecorderConfig({ maskLevel: 'moderate' })).toEqual({ maskLevel: 'moderate' });
    expect(getRecorderConfig({ maskLevel: 'lax' })).toEqual({ maskLevel: 'lax' });
    expect(getRecorderConfig({ maskLevel: 'loose' })).toEqual({});
  });

  test('only accepts known console levels', () => {
    expect(getRecorderConfig({ consoleLevel: 'warn' })).toEqual({ consoleLevel: 'warn' });
    expect(getRecorderConfig({ consoleLevel: 'all' })).toEqual({ consoleLevel: 'all' });
    expect(getRecorderConfig({ consoleLevel: 'verbose' })).toEqual({});
  });

  test('keeps an explicit canvas recording setting', () => {
    expect(getRecorderConfig({ recordCanvas: true })).toEqual({ recordCanvas: true });
    expect(getRecorderConfig({ recordCanvas: false })).toEqual({ recordCanvas: false });
    expect(getRecorderConfig({ recordCanvas: 'true' })).toEqual({});
  });

  test('clamps canvas fps and quality', () => {
    expect(getRecorderConfig({ canvasFps: 12.4, canvasQuality: 0.5 })).toEqual({
      canvasFps: 12,
      canvasQuality: 0.5,
    });
    expect(getRecorderConfig({ canvasFps: 0, canvasQuality: -1 })).toEqual({
      canvasFps: 1,
      canvasQuality: 0,
    });
    expect(getRecorderConfig({ canvasFps: 120, canvasQuality: 2 })).toEqual({
      canvasFps: 60,
      canvasQuality: 1,
    });
    expect(getRecorderConfig({ canvasFps: NaN, canvasQuality: '0.5' })).toEqual({});
  });

  test('rounds finite maxDuration and rejects non-finite values', () => {
    expect(getRecorderConfig({ maxDuration: 12.6 })).toEqual({ maxDuration: 13 });
    expect(getRecorderConfig({ maxDuration: Infinity })).toEqual({});
    expect(getRecorderConfig({ maxDuration: NaN })).toEqual({});
  });

  test('keeps a string blockSelector', () => {
    expect(getRecorderConfig({ blockSelector: '.hidden' })).toEqual({ blockSelector: '.hidden' });
    expect(getRecorderConfig({ blockSelector: 5 })).toEqual({});
  });
});

describe('getRecorderEnabled', () => {
  test('is true when replay or heatmap is enabled', () => {
    expect(getRecorderEnabled({ replayEnabled: true })).toBe(true);
    expect(getRecorderEnabled({ heatmapEnabled: true })).toBe(true);
  });

  test('is false otherwise', () => {
    expect(getRecorderEnabled({})).toBe(false);
    expect(getRecorderEnabled(null)).toBe(false);
    expect(getRecorderEnabled({ sampleRate: 1 })).toBe(false);
  });
});
