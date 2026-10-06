'use client';
import { Column } from '@umami/react-zen';
import { endOfMonth, startOfMonth } from 'date-fns';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { useDateRange, useTimezone } from '@/components/hooks';
import { Retention } from './Retention';

export function RetentionPage({ websiteId }: { websiteId: string }) {
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate },
  } = useDateRange({ timezone });

  const monthStartDate = startOfMonth(startDate);
  const monthEndDate = endOfMonth(startDate);

  return (
    <Column gap>
      <WebsiteControls websiteId={websiteId} allowDateFilter={false} allowMonthFilter />
      <Retention websiteId={websiteId} startDate={monthStartDate} endDate={monthEndDate} />
    </Column>
  );
}
