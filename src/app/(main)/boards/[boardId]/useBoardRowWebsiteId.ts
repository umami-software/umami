import { useMemo } from 'react';
import { BOARD_ENTITY_TYPES, getResolvedComponentEntity } from '@/lib/boards';
import type { Board, BoardColumn } from '@/lib/types';

/**
 * The website a row's filters should be resolved against — needed so the
 * filter dialog can look up property names, values and segments. Boards can
 * mix entities, so we take the first column bound to a website.
 */
export function useBoardRowWebsiteId(board: Partial<Board>, columns: BoardColumn[]) {
  return useMemo(() => {
    for (const column of columns ?? []) {
      const { entityType, entityId } = getResolvedComponentEntity(board, column.component);

      if (entityId && (!entityType || entityType === BOARD_ENTITY_TYPES.website)) {
        return entityId;
      }
    }

    return undefined;
  }, [board, columns]);
}
