'use client';
import { Column } from '@umami/react-zen';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { ReplayModal } from './ReplayModal';
import { ReplaysDataTable } from './ReplaysDataTable';

export function ReplaysPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <ReplaysDataTable websiteId={websiteId} />
      </Panel>
      <SessionModal websiteId={websiteId} />
      <ReplayModal websiteId={websiteId} />
    </Column>
  );
}
