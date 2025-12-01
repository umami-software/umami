import { Metadata } from 'next';
import { SegmentsPage } from './SegmentsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <SegmentsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Segments',
};
