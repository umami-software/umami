import { LinkPage } from './LinkPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;

  return <LinkPage linkId={linkId} />;
}

export const metadata: Metadata = {
  title: 'Link',
};
