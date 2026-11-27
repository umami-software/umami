import type { Metadata } from 'next';
import { SessionsPropertiesPage } from './SessionsPropertiesPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <SessionsPropertiesPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Session Properties',
};
