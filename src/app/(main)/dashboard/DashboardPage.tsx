'use client';
import { Column, Row } from '@umami/react-zen';
import { useMemo } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { DateFilter } from '@/components/input/DateFilter';
import { getDateRangeValue } from '@/lib/date';
import { DashboardView } from './DashboardView';

const DASHBOARD_DEFAULT_DATE = '30day';

export function DashboardPage() {
  const { formatMessage, labels } = useMessages();
  const { dateRange } = useDateRange();
  const {
    router,
    updateParams,
    query: { date = '', offset = 0 },
  } = useNavigation();

  const dateValue = useMemo(() => {
    if (!date) return DASHBOARD_DEFAULT_DATE;
    return offset !== 0
      ? getDateRangeValue(dateRange.startDate, dateRange.endDate)
      : dateRange.value;
  }, [date, offset, dateRange]);

  const handleDateChange = (value: string) => {
    router.push(updateParams({ date: value, offset: undefined }));
  };

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <Row alignItems="center" justifyContent="space-between" wrap="wrap" gap>
          <PageHeader title={formatMessage(labels.dashboard)} />
          <Row minWidth="200px">
            <DateFilter value={dateValue} onChange={handleDateChange} />
          </Row>
        </Row>
        <DashboardView defaultDate={DASHBOARD_DEFAULT_DATE} />
      </Column>
    </PageBody>
  );
}
