'use client';
import { Column } from '@umami/react-zen';
import { RetentionTable } from './RetentionTable';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';

export function RetentionPage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <RetentionTable websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
