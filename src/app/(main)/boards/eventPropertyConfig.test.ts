import { describe, expect, test } from 'vitest';
import {
  getEventNames,
  getPropertyDataType,
  getPropertyNames,
  withSavedOption,
} from './eventPropertyConfig';

const data = [
  { eventName: 'link_click', propertyName: 'target', dataType: 1 },
  { eventName: 'link_click', propertyName: 'tags', dataType: 5 },
  { eventName: 'checkout', propertyName: 'target', dataType: 1 },
  { eventName: 'checkout', propertyName: 'amount', dataType: 2 },
];

describe('withSavedOption', () => {
  test('returns the options unchanged when the saved value is present', () => {
    expect(withSavedOption(['a', 'b'], 'b')).toEqual(['a', 'b']);
  });

  test('adds a saved value that is missing from the current data', () => {
    expect(withSavedOption(['a', 'b'], 'gone')).toEqual(['gone', 'a', 'b']);
    expect(withSavedOption([], 'gone')).toEqual(['gone']);
  });

  test('ignores an empty saved value', () => {
    expect(withSavedOption(['a'], '')).toEqual(['a']);
    expect(withSavedOption(['a'], undefined)).toEqual(['a']);
  });
});

describe('event property options', () => {
  test('lists unique event names', () => {
    expect(getEventNames(data)).toEqual(['link_click', 'checkout']);
  });

  test('lists the properties of the selected event only', () => {
    expect(getPropertyNames(data, 'checkout')).toEqual(['target', 'amount']);
    expect(getPropertyNames(data, '')).toEqual([]);
  });

  test('resolves the data type of a property', () => {
    expect(getPropertyDataType(data, 'link_click', 'tags')).toBe(5);
    expect(getPropertyDataType(data, 'link_click', 'amount')).toBeUndefined();
  });
});
