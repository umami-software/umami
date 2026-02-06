import type { Metadata } from 'next';
import { RecordingPlayback } from './RecordingPlayback';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <RecordingPlayback websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Recording Playback',
};
