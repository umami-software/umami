import type { Metadata } from 'next';
import { ReplayPlayback } from './ReplayPlayback';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <ReplayPlayback websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Session Replay',
};
