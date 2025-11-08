'use client';
import { Column } from '@umami/react-zen';
import { CohortsDataTable } from './CohortsDataTable';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';

export function CohortsPage({ websiteId }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} allowFilter={false} allowDateFilter={false} />
      <Panel>
        <CohortsDataTable websiteId={websiteId} />
      </Panel>
    </Column>
  );
}
