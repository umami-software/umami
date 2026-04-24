import type { Metadata } from 'next';
import { BoardDesignPage } from '../BoardEditPage';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <BoardDesignPage boardId={boardId} />;
}

export const metadata: Metadata = {
  title: 'Design Board',
};
