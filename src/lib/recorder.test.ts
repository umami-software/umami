import { expect, test } from 'vitest';
import { getRecorderConfig } from './recorder';

test('getRecorderConfig normalizes legacy none mask level to lax', () => {
  expect(getRecorderConfig({ maskLevel: 'none' })).toEqual({ maskLevel: 'lax' });
});

test('getRecorderConfig allows lax mask level', () => {
  expect(getRecorderConfig({ maskLevel: 'lax' })).toEqual({ maskLevel: 'lax' });
});

test('getRecorderConfig preserves explicit canvas recording setting', () => {
  expect(getRecorderConfig({ recordCanvas: false })).toEqual({ recordCanvas: false });
  expect(getRecorderConfig({ recordCanvas: true })).toEqual({ recordCanvas: true });
});
