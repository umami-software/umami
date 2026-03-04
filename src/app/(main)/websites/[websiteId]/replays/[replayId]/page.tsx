import type { Metadata } from 'next';
import { ReplayPlayback } from './ReplayPlayback';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; replayId: string }>;
}) {
  const { websiteId, replayId } = await params;

  return <ReplayPlayback websiteId={websiteId} replayId={replayId} />;
}

export const metadata: Metadata = {
  title: 'Session Replay',
};
