import { Metadata } from 'next';
import { Board } from './Board';

export default async function ({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <Board boardId={boardId} />;
}

export const metadata: Metadata = {
  title: 'Board',
};
