import { SessionsPage } from './SessionsPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <SessionsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Sessions',
};
