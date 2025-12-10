import type { Metadata } from 'next';
import { WebsitePage } from './WebsitePage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsitePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
