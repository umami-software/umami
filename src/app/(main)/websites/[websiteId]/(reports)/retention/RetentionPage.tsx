'use client';
import { Column } from '@umami/react-zen';
import { Retention } from './Retention';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange } from '@/components/hooks';
import { endOfMonth, startOfMonth } from 'date-fns';

export function RetentionPage({ websiteId }: { websiteId: string }) {
  const {
    dateRange: { startDate },
  } = useDateRange();

  const monthStartDate = startOfMonth(startDate);
  const monthEndDate = endOfMonth(startDate);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowDateFilter={false} allowMonthFilter />
      <Retention websiteId={websiteId} startDate={monthStartDate} endDate={monthEndDate} />
    </Column>
  );
}
