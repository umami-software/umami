'use client';
import { Column } from '@umami/react-zen';
import { SegmentsDataTable } from './SegmentsDataTable';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';

export function SegmentsPage({ websiteId }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} allowFilter={false} allowDateFilter={false} />
      <Panel>
        <SegmentsDataTable websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
