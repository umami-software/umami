import Share from './Share';
import { Metadata } from 'next';

export default function ({ params: { shareId } }) {
  return <Share shareId={shareId[0]} />;
}

export const metadata: Metadata = {
  title: 'umami',
};
