'use client';
import { Column } from '@umami/react-zen';
import { Insights } from './Insights';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange } from '@/components/hooks';

export function InsightsPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <Insights websiteId={websiteId} startDate={startDate} endDate={endDate} />
    </Column>
  );
}
