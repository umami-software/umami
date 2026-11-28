import type { Metadata } from 'next';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 8px)',
        overflow: 'clip',
      }}
    >
      <SessionProfile websiteId={websiteId} sessionId={sessionId} />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Session',
};
