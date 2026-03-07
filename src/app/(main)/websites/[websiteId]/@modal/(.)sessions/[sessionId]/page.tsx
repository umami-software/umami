import { SessionProfileModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfileModal';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <SessionProfileModal websiteId={websiteId} sessionId={sessionId} />;
}
