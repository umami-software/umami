import SessionsPage from './SessionsPage';
import { Metadata } from 'next';

export default function ({ params: { websiteId } }) {
  return <SessionsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Sessions',
};
