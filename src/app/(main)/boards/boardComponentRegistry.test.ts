import { describe, expect, test } from 'vitest';
import { getComponentDefinition } from './boardComponentRegistry';

describe('EventProperties board component', () => {
  test('is registered with event, property and rows fields', () => {
    const definition = getComponentDefinition('EventProperties');

    expect(definition?.group).toBe('Events');
    expect(definition?.defaultProps).toEqual({ limit: 10 });
    expect(
      definition?.configFields?.map(({ name, type, required }) => [name, type, !!required]),
    ).toEqual([
      ['eventName', 'event', true],
      ['propertyName', 'eventProperty', true],
      ['limit', 'select', false],
    ]);
    expect(definition?.configFields?.[2].options?.map(({ value }) => value)).toEqual([
      '5',
      '10',
      '20',
    ]);
  });
});
