import { Box, Row } from '@umami/react-zen';
import { FilterScopeProvider } from '@/components/common/FilterScopeProvider';
import { useBoard } from '@/components/hooks';
import { getResolvedComponentEntity } from '@/lib/boards';
import type { BoardRow as BoardRowType } from '@/lib/types';
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

  return (
    <Row gap="3" width="100%" overflowX="auto">
      {columns.map(column => {
        const { entityId } = getResolvedComponentEntity(board, column.component);
        const isScoped = scope.appliesTo(entityId);
        const content = (
          <BoardViewColumn
            component={column.component}
            showEntityBadge={showEntityBadges}
            rowFilters={isScoped ? filters : undefined}
            filterWebsiteId={scope.targetWebsiteId}
          />
        );

        return (
          <Box
            key={column.id}
            flexGrow={column.size ?? 1}
            flexShrink={1}
            flexBasis="0%"
            minWidth={`${MIN_COLUMN_WIDTH}px`}
          >
            {isScoped ? (
              <FilterScopeProvider params={scope.params}>{content}</FilterScopeProvider>
            ) : (
              content
            )}
          </Box>
        );
      })}
    </Row>
  );
}
