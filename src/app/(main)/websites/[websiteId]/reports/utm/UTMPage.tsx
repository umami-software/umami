'use client';
import { Column } from '@umami/react-zen';
import { useDateRange } from '@/components/hooks';
import { UTM } from './UTM';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';

export function UTMPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate, endDate },
  } = useDateRange(websiteId);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowCompare={false} />
      <UTM websiteId={websiteId} startDate={startDate} endDate={endDate} />
    </Column>
  );
}
