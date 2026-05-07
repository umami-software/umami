import type { Metadata } from 'next';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <SessionProfile websiteId={websiteId} sessionId={sessionId} />;
}

export const metadata: Metadata = {
  title: 'Session',
};
