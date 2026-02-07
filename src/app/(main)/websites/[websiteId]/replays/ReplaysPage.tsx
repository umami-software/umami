'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { ReplaysDataTable } from './ReplaysDataTable';

export function ReplaysPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <ReplaysDataTable websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
