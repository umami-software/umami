import { Box, Column, Row } from '@umami/react-zen';
import { FilterScopeProvider } from '@/components/common/FilterScopeProvider';
import { useBoard } from '@/components/hooks';
import { getResolvedComponentEntity } from '@/lib/boards';
import type { BoardRow as BoardRowType } from '@/lib/types';
import { BoardRowFilterTags } from './BoardRowFilterTags';
import { BoardViewColumn } from './BoardViewColumn';
import { MIN_COLUMN_WIDTH } from './boardConstants';
import { useBoardRowScope } from './useBoardRowScope';

export function BoardViewRow({
  row,
  showEntityBadges = true,
}: {
  row: BoardRowType;
  showEntityBadges?: boolean;
}) {
  const { board } = useBoard();
  const { columns, filters } = row;
  const scope = useBoardRowScope(board, columns, filters);

  const columnsRow = (
    <Row gap="3" width="100%" overflowX="auto">
      {columns.map(column => {
        const { entityId } = getResolvedComponentEntity(board, column.component);
        const content = (
          <BoardViewColumn component={column.component} showEntityBadge={showEntityBadges} />
        );

        return (
          <Box
            key={column.id}
            flexGrow={column.size ?? 1}
            flexShrink={1}
            flexBasis="0%"
            minWidth={`${MIN_COLUMN_WIDTH}px`}
          >
            {scope.appliesTo(entityId) ? (
              <FilterScopeProvider params={scope.params}>{content}</FilterScopeProvider>
            ) : (
              content
            )}
          </Box>
        );
      })}
    </Row>
  );

  // Rows without filters render exactly as before — no extra wrapper.
  if (!scope.hasFilters) {
    return columnsRow;
  }

  return (
    <Column gap="2" width="100%">
      <BoardRowFilterTags
        rowFilters={filters}
        websiteId={scope.targetWebsiteId}
        showEntity={scope.isMixed}
      />
      {columnsRow}
    </Column>
  );
}
