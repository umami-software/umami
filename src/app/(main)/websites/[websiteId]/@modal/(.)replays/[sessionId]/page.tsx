import { ReplayModal } from '@/app/(main)/websites/[websiteId]/replays/ReplayModal';

export default async function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = await params;

  return <ReplayModal websiteId={websiteId} sessionId={sessionId} />;
}
