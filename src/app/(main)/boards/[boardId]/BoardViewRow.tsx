import { Box, Row } from '@umami/react-zen';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import type { BoardColumn } from '@/lib/types';
import { BoardViewColumn } from './BoardViewColumn';
import { MIN_COLUMN_WIDTH } from './boardConstants';

export function BoardViewRow({
  columns,
  showEntityBadges = true,
}: {
  columns: BoardColumn[];
  showEntityBadges?: boolean;
}) {
  return (
    <OverlayScrollArea orientation="horizontal" style={{ width: '100%' }}>
      <Row gap="3" width="100%">
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
    </OverlayScrollArea>
  );
}
