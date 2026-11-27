'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { SessionModal } from './SessionModal';
import { SessionsDataTable } from './SessionsDataTable';

export function SessionsPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <SessionsDataTable websiteId={websiteId} />
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
