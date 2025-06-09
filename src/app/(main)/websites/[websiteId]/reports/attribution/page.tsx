import { Metadata } from 'next';
import { AttributionPage } from './AttributionPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <AttributionPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Attribution',
};
