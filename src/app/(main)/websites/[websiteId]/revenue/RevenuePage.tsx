'use client';
import { Column } from '@umami/react-zen';
import { RevenueView } from './RevenueView';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function RevenuePage({ websiteId }: { websiteId: string }) {
  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowCompare={false} />
      <RevenueView websiteId={websiteId} />
    </Column>
  );
}
