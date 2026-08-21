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
 * scoped. `targetWebsiteId` is also what the filter dialog resolves property
 * names, values and segments against.
 */
export function useBoardRowScope(
  board: Partial<Board>,
  columns: BoardColumn[],
  rowFilters?: BoardRowFilters,
) {
  return useMemo(() => {
    const websiteIds: string[] = [];

    for (const column of columns ?? []) {
      const { entityType, entityId } = getResolvedComponentEntity(board, column.component);

      if (entityId && (!entityType || entityType === BOARD_ENTITY_TYPES.website)) {
        websiteIds.push(entityId);
      }
    }

    const uniqueWebsiteIds = [...new Set(websiteIds)];
    // Filters saved before a website was recorded fall back to the row's own
    // website, which is the one the dialog would have been opened against.
    const targetWebsiteId = rowFilters?.websiteId ?? uniqueWebsiteIds[0];
    const params = boardRowFiltersToParams(rowFilters);
    const hasFilters = Object.keys(params).length > 0;

    return {
      params,
      hasFilters,
      targetWebsiteId,
      isMixed: uniqueWebsiteIds.length > 1,
      appliesTo: (entityId?: string) => hasFilters && !!entityId && entityId === targetWebsiteId,
    };
  }, [board, columns, rowFilters]);
}
