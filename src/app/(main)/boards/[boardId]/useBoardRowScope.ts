import { useMemo } from 'react';
import { BOARD_ENTITY_TYPES, getResolvedComponentEntity } from '@/lib/boards';
import { boardRowFiltersToParams } from '@/lib/params';
import type { Board, BoardColumn, BoardRowFilters } from '@/lib/types';

/**
 * Works out how a row's saved filters apply to its columns.
 *
 * A mixed board resolves entities per column, so a row can hold columns for
 * different websites (or for pixels and links, which have no session
 * properties or segments at all). Row filters therefore target one website —
 * the one they were authored against — and only the columns showing it are
 * scoped.
 *
 * The target is reconciled against the row's current columns on every render
 * rather than when columns change, because the website a column shows can
 * also change from outside the row (the board-level website). When the
 * recorded website is no longer in the row the filters are stale: they apply
 * to no column — segments, cohorts and session properties are meaningless on
 * another website — but are kept, so nothing is lost until the row is edited.
 */
export function resolveBoardRowScope(
  board: Partial<Board>,
  columns: BoardColumn[],
  rowFilters?: BoardRowFilters,
) {
  const websiteIds: string[] = [];

  for (const column of columns ?? []) {
    const { entityType, entityId } = getResolvedComponentEntity(board, column.component);

    if (entityId && (!entityType || entityType === BOARD_ENTITY_TYPES.website)) {
      websiteIds.push(entityId);
    }
  }

  const params = boardRowFiltersToParams(rowFilters);
  const hasFilters = Object.keys(params).length > 0;
  const recordedWebsiteId = rowFilters?.websiteId;
  // Never inferred: guessing from the current columns would retarget the
  // filters whenever columns are reordered or added.
  const targetWebsiteId =
    hasFilters && recordedWebsiteId && websiteIds.includes(recordedWebsiteId)
      ? recordedWebsiteId
      : undefined;
  const isStale = hasFilters && !targetWebsiteId;
  // What the filter dialog resolves property names, values and segments
  // against: the filters' own website, or the row's first one for new (or
  // stale) filters.
  const editWebsiteId = targetWebsiteId ?? websiteIds[0];
  // Reopening stale filters against a different website keeps only the
  // standard field filters, which mean the same on any website.
  const editValues: BoardRowFilters | undefined = isStale
    ? { filters: rowFilters?.filters, match: rowFilters?.match }
    : rowFilters;

  return {
    params,
    hasFilters,
    isStale,
    targetWebsiteId,
    editWebsiteId,
    editValues,
    appliesTo: (entityId?: string) => !!targetWebsiteId && entityId === targetWebsiteId,
  };
}

export function useBoardRowScope(
  board: Partial<Board>,
  columns: BoardColumn[],
  rowFilters?: BoardRowFilters,
) {
  return useMemo(
    () => resolveBoardRowScope(board, columns, rowFilters),
    [board, columns, rowFilters],
  );
}
