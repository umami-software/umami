import SessionDetailsPage from './SessionDetailsPage';
import { Metadata } from 'next';

export default function WebsitePage({ params: { websiteId, sessionId } }) {
  return <SessionDetailsPage websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
