'use client';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function ({
  params,
}: {
  params: Promise<{ websiteId: string; sessionId: string }>;
}) {
  const { websiteId, sessionId } = use(params);
  const router = useRouter();

  return (
    <SessionProfile
      websiteId={websiteId}
      sessionId={sessionId}
      onDelete={() => router.push(`/websites/${websiteId}/sessions`)}
    />
  );
}
