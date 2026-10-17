'use client';
import { Column } from '@umami/react-zen';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useTimezone } from '@/components/hooks';
import { UTM } from './UTM';

export function UTMPage({ websiteId }: { websiteId: string }) {
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate },
  } = useDateRange({ timezone });

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} />
      <UTM websiteId={websiteId} startDate={startDate} endDate={endDate} />
    </Column>
  );
}
