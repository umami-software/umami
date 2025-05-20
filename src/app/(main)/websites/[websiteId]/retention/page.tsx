import { Metadata } from 'next';
import { RetentionPage } from './RetentionPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <RetentionPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Retention',
};
