import type { Metadata } from 'next';
import { CommercePage } from './CommercePage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <CommercePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Commerce',
};
