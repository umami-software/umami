import type { Metadata } from 'next';
import { RecordingsPage } from './RecordingsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <RecordingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Recordings',
};
