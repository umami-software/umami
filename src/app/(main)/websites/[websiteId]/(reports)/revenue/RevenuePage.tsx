'use client';
import { Column } from '@umami/react-zen';
import { Revenue } from './Revenue';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange } from '@/components/hooks';

export function RevenuePage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Revenue websiteId={websiteId} startDate={startDate} endDate={endDate} />
    </Column>
  );
}
