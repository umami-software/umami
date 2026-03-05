import type { Metadata } from 'next';
import { PerformancePage } from './PerformancePage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <PerformancePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Performance',
};
