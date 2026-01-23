import type { Metadata } from 'next';
import { LinkPage } from './LinkPage';

export default async function ({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;

  return <LinkPage linkId={linkId} />;
}

export const metadata: Metadata = {
  title: 'Link',
};
