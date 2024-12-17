import SessionDetailsPage from './SessionDetailsPage';
import { Metadata } from 'next';

export default async function WebsitePage({
  params,
}: {
  params: { websiteId: string; sessionId: string };
}) {
  const { websiteId, sessionId } = await params;

  return <SessionDetailsPage websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
