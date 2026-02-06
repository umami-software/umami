import type { Metadata } from 'next';
import { BoardPage } from '../BoardPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <BoardPage boardId={boardId} editing />;
}

export const metadata: Metadata = {
  title: 'Edit Board',
};
