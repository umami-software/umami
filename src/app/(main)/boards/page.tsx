import { Metadata } from 'next';
import { BoardsPage } from './BoardsPage';

export default function () {
  return <BoardsPage />;
}

export const metadata: Metadata = {
  title: 'Boards',
};
