import { AdminWebsitePage } from './AdminWebsitePage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <AdminWebsitePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website',
};
