import type { Metadata } from 'next';
import { ErrorsPage } from './ErrorsPage';

export default async function Page({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;
  return <ErrorsPage websiteId={websiteId} />;
}
export const metadata: Metadata = { title: 'Errors' };
