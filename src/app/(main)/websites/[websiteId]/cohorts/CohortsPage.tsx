'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { CohortsDataTable } from './CohortsDataTable';

export function CohortsPage({ websiteId }) {
  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} allowFilter={false} allowDateFilter={false} />
      <CohortsDataTable websiteId={websiteId} />
    </Column>
  );
}
