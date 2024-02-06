import SharePage from './SharePage';
import { Metadata } from 'next';

export default function ({ params: { shareId } }) {
  return <SharePage shareId={shareId[0]} />;
}

export const metadata: Metadata = {
  title: 'umami',
};
