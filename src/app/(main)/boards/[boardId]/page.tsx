import type { Metadata } from 'next';
import { BoardPage } from './BoardPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <BoardPage boardId={boardId !== 'create' ? boardId : undefined} />;
}

export const metadata: Metadata = {
  title: 'Board',
};
