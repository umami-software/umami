import { WebsiteReportsPage } from './WebsiteReportsPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsiteReportsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website Reports',
};
