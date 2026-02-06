'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { RecordingsDataTable } from './RecordingsDataTable';

export function RecordingsPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <RecordingsDataTable websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
