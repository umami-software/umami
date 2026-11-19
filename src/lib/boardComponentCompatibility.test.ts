import { describe, expect, test } from 'vitest';
import {
  getSupportedBoardComponentEntityTypes,
  isBoardComponentSupportedByEntityType,
} from './boardComponentCompatibility';

describe('getSupportedBoardComponentEntityTypes', () => {
  test('returns the supported entity types for a known component', () => {
    expect(getSupportedBoardComponentEntityTypes('Funnel')).toEqual(['website']);
  });

  test('returns undefined for an unknown component', () => {
    expect(getSupportedBoardComponentEntityTypes('Unknown')).toBeUndefined();
  });
});

describe('isBoardComponentSupportedByEntityType', () => {
  test('returns true when the entity type is supported', () => {
    expect(isBoardComponentSupportedByEntityType('Funnel', 'website')).toBe(true);
  });

  test('returns false when the entity type is not supported', () => {
    expect(isBoardComponentSupportedByEntityType('Funnel', 'segment' as any)).toBe(false);
  });

  test('returns true when no entity type is provided', () => {
    expect(isBoardComponentSupportedByEntityType('Funnel')).toBe(true);
  });

  test('returns true for components without a compatibility entry', () => {
    expect(isBoardComponentSupportedByEntityType('Unknown', 'website')).toBe(true);
  });
});
