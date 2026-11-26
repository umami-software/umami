import type { Metadata } from 'next';
import { WebsiteMetricsPage } from './WebsiteMetricsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsiteMetricsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Metrics',
};
