import { describe, expect, test } from 'vitest';
import type { BoardColumn, BoardRowFilters } from '@/lib/types';
import { resolveBoardRowScope } from './useBoardRowScope';

const board = { type: 'mixed', parameters: {} } as any;

function websiteColumn(websiteId: string): BoardColumn {
  return {
    id: websiteId,
    component: { type: 'WebsiteMetricsBar', entityType: 'website', entityId: websiteId },
  } as BoardColumn;
}

function pixelColumn(pixelId: string): BoardColumn {
  return {
    id: pixelId,
    component: { type: 'PixelMetricsBar', entityType: 'pixel', entityId: pixelId },
  } as BoardColumn;
}

const filters: BoardRowFilters = {
  websiteId: 'site-a',
  filters: [{ name: 'browser', operator: 'eq', value: 'chrome' }] as any,
  sessionPropertyFilters: [
    { propertyName: 'user_region', dataType: 1, operator: 'eq', value: 'west' },
  ] as any,
  segment: 'segment-a',
};

describe('resolveBoardRowScope', () => {
  test('targets the recorded website wherever it sits in the row', () => {
    const scope = resolveBoardRowScope(
      board,
      [websiteColumn('site-b'), websiteColumn('site-a')],
      filters,
    );

    expect(scope.isStale).toBe(false);
    expect(scope.targetWebsiteId).toBe('site-a');
    expect(scope.editWebsiteId).toBe('site-a');
    expect(scope.editValues).toBe(filters);
    expect(scope.appliesTo('site-a')).toBe(true);
    expect(scope.appliesTo('site-b')).toBe(false);
  });

  test('applies nowhere once the recorded website leaves the row', () => {
    const scope = resolveBoardRowScope(board, [websiteColumn('site-b')], filters);

    expect(scope.isStale).toBe(true);
    expect(scope.targetWebsiteId).toBeUndefined();
    expect(scope.appliesTo('site-a')).toBe(false);
    expect(scope.appliesTo('site-b')).toBe(false);
  });

  test('reopens stale filters on the current website with only field filters', () => {
    const scope = resolveBoardRowScope(board, [websiteColumn('site-b')], filters);

    expect(scope.editWebsiteId).toBe('site-b');
    expect(scope.editValues).toEqual({ filters: filters.filters, match: undefined });
  });

  test('follows a board-level website change', () => {
    const websiteBoard = { type: 'website', parameters: { websiteId: 'site-b' } } as any;
    const scope = resolveBoardRowScope(websiteBoard, [websiteColumn('site-a')], filters);

    expect(scope.isStale).toBe(true);
  });

  test('never infers a target for filters without a recorded website', () => {
    const { websiteId: _websiteId, ...unrecorded } = filters;
    const scope = resolveBoardRowScope(
      board,
      [websiteColumn('site-a'), websiteColumn('site-b')],
      unrecorded,
    );

    expect(scope.isStale).toBe(true);
    expect(scope.appliesTo('site-a')).toBe(false);
  });

  test('has no website to edit against on a pixel-only row', () => {
    const scope = resolveBoardRowScope(board, [pixelColumn('pixel-a')]);

    expect(scope.hasFilters).toBe(false);
    expect(scope.isStale).toBe(false);
    expect(scope.editWebsiteId).toBeUndefined();
  });

  test('offers the first website for a row without filters', () => {
    const scope = resolveBoardRowScope(board, [pixelColumn('pixel-a'), websiteColumn('site-b')]);

    expect(scope.isStale).toBe(false);
    expect(scope.editWebsiteId).toBe('site-b');
  });
});
