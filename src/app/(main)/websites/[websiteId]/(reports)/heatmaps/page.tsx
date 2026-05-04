import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeatmapsPage } from './HeatmapsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  if (!process.env.UMAMI_SELF_RECORD) {
    notFound();
  }

  const { websiteId } = await params;

  return <HeatmapsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Heatmaps',
};
