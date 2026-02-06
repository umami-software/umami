import { useBoard } from '@/components/hooks';
import { BoardEditHeader } from './BoardEditHeader';
import { BoardViewHeader } from './BoardViewHeader';

export function BoardHeader() {
  const { board, editing } = useBoard();

  if (editing) {
    return <BoardEditHeader />;
  }

  return <BoardViewHeader />;
}
