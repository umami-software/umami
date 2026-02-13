import { useBoard } from '@/components/hooks';
import { BoardViewRow } from './BoardViewRow';

export function BoardViewBody() {
  const { board } = useBoard();
  const rows = board?.parameters?.rows ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map(row => (
        <BoardViewRow key={row.id} columns={row.columns} />
      ))}
    </div>
  );
}
