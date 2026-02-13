import { Box, Row } from '@umami/react-zen';
import type { BoardColumn } from '@/lib/types';
import { BoardViewColumn } from './BoardViewColumn';
import { MIN_COLUMN_WIDTH } from './boardConstants';

export function BoardViewRow({ columns }: { columns: BoardColumn[] }) {
  return (
    <Row gap="3" width="100%" overflowX="auto">
      {columns.map(column => (
        <Box
          key={column.id}
          flexGrow={column.size ?? 1}
          flexShrink={1}
          flexBasis="0%"
          minWidth={`${MIN_COLUMN_WIDTH}px`}
        >
          <BoardViewColumn component={column.component} />
        </Box>
      ))}
    </Row>
  );
}
