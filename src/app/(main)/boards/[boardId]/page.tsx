import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BoardViewPage } from './BoardViewPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  if (boardId === 'create') {
    redirect('/boards');
  }

  return <BoardViewPage boardId={boardId} />;
}

export const metadata: Metadata = {
  title: 'Board',
};
