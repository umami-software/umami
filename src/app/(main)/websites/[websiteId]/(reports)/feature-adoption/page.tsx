import type { Metadata } from 'next';
import { FeatureAdoptionPage } from './FeatureAdoptionPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <FeatureAdoptionPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Feature adoption',
};
