import BoardsPage from './BoardsPage';
import { Metadata } from 'next';

export default function () {
  return <BoardsPage />;
}

export const metadata: Metadata = {
  title: 'Boards',
};
