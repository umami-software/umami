import { Metadata } from 'next';
import { RevenuePage } from './RevenuePage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <RevenuePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Revenue',
};
