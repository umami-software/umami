import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { flags } from '@/lib/flags';
import { CommercePage } from './CommercePage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  if (!(await flags.commerce())) {
    notFound();
  }

  return <CommercePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Commerce',
};
