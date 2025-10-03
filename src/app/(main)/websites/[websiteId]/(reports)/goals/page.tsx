import { Metadata } from 'next';
import { GoalsPage } from './GoalsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <GoalsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Goals',
};
