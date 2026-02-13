import type { BoardColumn } from '@/lib/types';
import { BoardViewColumn } from './BoardViewColumn';
import { MIN_COLUMN_WIDTH } from './boardConstants';

export function BoardViewRow({ columns }: { columns: BoardColumn[] }) {
  return (
    <div style={{ display: 'flex', gap: 12, width: '100%', overflowX: 'auto' }}>
      {columns.map(column => (
        <div
          key={column.id}
          style={{
            flex: `${column.size ?? 1} 1 0%`,
            minWidth: MIN_COLUMN_WIDTH,
          }}
        >
          <BoardViewColumn component={column.component} />
        </div>
      ))}
    </div>
  );
}
