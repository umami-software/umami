'use client';
import { Column } from '@umami/react-zen';
import { Retention } from './Retention';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange } from '@/components/hooks';

export function RetentionPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Retention websiteId={websiteId} startDate={startDate} endDate={endDate} />
    </Column>
  );
}
