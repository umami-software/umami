import type { Metadata } from 'next';
import { BoardEditPage } from './BoardEditPage';
import { BoardViewPage } from './BoardViewPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const isCreate = boardId === 'create';

  if (isCreate) {
    return <BoardEditPage />;
  }

  return <BoardViewPage boardId={boardId} />;
}

export const metadata: Metadata = {
  title: 'Board',
};
