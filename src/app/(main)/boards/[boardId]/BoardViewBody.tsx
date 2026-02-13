import { Column } from '@umami/react-zen';
import { useBoard } from '@/components/hooks';
import { BoardViewRow } from './BoardViewRow';

export function BoardViewBody() {
  const { board } = useBoard();
  const rows = board?.parameters?.rows ?? [];

  return (
    <Column gap="3">
      {rows.map(row => (
        <BoardViewRow key={row.id} columns={row.columns} />
      ))}
    </Column>
  );
}
