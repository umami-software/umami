import { Box, Column, Row } from '@umami/react-zen';
import { FilterScopeProvider } from '@/components/common/FilterScopeProvider';
import { useBoard } from '@/components/hooks';
import { boardRowFiltersToParams } from '@/lib/params';
import type { BoardRow as BoardRowType } from '@/lib/types';
import { BoardRowFilterTags } from './BoardRowFilterTags';
import { BoardViewColumn } from './BoardViewColumn';
import { MIN_COLUMN_WIDTH } from './boardConstants';
import { useBoardRowWebsiteId } from './useBoardRowWebsiteId';

export function BoardViewRow({
  row,
  showEntityBadges = true,
}: {
  row: BoardRowType;
  showEntityBadges?: boolean;
}) {
  const { board } = useBoard();
  const { columns, filters } = row;
  const websiteId = useBoardRowWebsiteId(board, columns);

  const scopeParams = boardRowFiltersToParams(filters);

  const columnsRow = (
    <Row gap="3" width="100%" overflowX="auto">
      {columns.map(column => (
        <Box
          key={column.id}
          flexGrow={column.size ?? 1}
          flexShrink={1}
          flexBasis="0%"
          minWidth={`${MIN_COLUMN_WIDTH}px`}
        >
          <BoardViewColumn component={column.component} showEntityBadge={showEntityBadges} />
        </Box>
      ))}
    </Row>
  );

  // Rows without filters render exactly as before — no extra wrapper.
  if (!Object.keys(scopeParams).length) {
    return columnsRow;
  }

  return (
    <FilterScopeProvider params={scopeParams}>
      <Column gap="2" width="100%">
        <BoardRowFilterTags rowFilters={filters} websiteId={websiteId} />
        {columnsRow}
      </Column>
    </FilterScopeProvider>
  );
}
