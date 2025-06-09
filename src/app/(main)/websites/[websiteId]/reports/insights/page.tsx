import { Metadata } from 'next';
import { InsightsPage } from './InsightsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <InsightsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Insights',
};
