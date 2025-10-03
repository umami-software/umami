import { Metadata } from 'next';
import { JourneysPage } from './JourneysPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <JourneysPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Journeys',
};
