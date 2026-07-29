import type { Metadata } from 'next';
import { HeatmapsPage } from './HeatmapsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <HeatmapsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Heatmaps',
};
