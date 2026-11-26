'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { SegmentsDataTable } from './SegmentsDataTable';

export function SegmentsPage({ websiteId }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} allowFilter={false} allowDateFilter={false} />
      <SegmentsDataTable websiteId={websiteId} />
    </Column>
  );
}
