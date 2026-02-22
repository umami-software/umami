import type { Metadata } from 'next';
import { BoardEditPage } from '../BoardEditPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <BoardEditPage boardId={boardId} />;
}

export const metadata: Metadata = {
  title: 'Edit Board',
};
