import { Column, Heading, Text } from '@umami/react-zen';
import { useState } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { useApi, useDateParameters, useMessages } from '@/components/hooks';
import type { SavedCommerceReport as Definition } from '@/lib/commerce-saved-reports';
import { CheckoutMetricsBar, CheckoutStages } from './CommerceCheckout';
import { ProductPerformanceTable } from './CommerceProducts';

export function SavedCommerceReport({
  websiteId,
  reportId,
  dateMode = 'saved',
}: {
  websiteId: string;
  reportId: string;
  dateMode?: string;
}) {
  const { get, useQuery } = useApi();
  const { t } = useMessages();
  const [page, setPage] = useState(1);
  const { startAt, endAt } = useDateParameters();
  const dates = dateMode === 'board' ? { startAt, endAt } : {};
  const { data, isLoading, error } = useQuery<{ report: Definition; data: any }>({
    queryKey: ['commerce-saved-result', websiteId, reportId, page, dates],
    queryFn: () =>
      get(`/websites/${websiteId}/commerce/reports/${reportId}/stats`, { page, ...dates }),
    enabled: !!reportId,
  });
  if (!reportId) return <Text>{t('commerce.selectSavedReport')}</Text>;
  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Column gap>
          <Heading>{data.report.name}</Heading>
          <Text color="muted">
            {data.report.parameters.currency} ·{' '}
            {data.report.parameters.market || t('commerce.allMarkets')} ·{' '}
            {dateMode === 'board'
              ? t('commerce.boardDates')
              : data.report.parameters.date.mode === 'rolling'
                ? t('commerce.rollingDays', { days: data.report.parameters.date.days })
                : t('commerce.fixedDates')}
          </Text>
          {data.report.parameters.type === 'products' ? (
            <>
              <Text color="muted">{t('commerce.productConversionHint')}</Text>
              <ProductPerformanceTable
                data={data.data.data || []}
                currency={data.report.parameters.currency}
                groupBy={data.report.parameters.groupBy}
                columns={data.report.parameters.columns}
              />
              <Pager {...data.data} onPageChange={setPage} />
            </>
          ) : (
            <>
              <CheckoutMetricsBar data={data.data} currency={data.report.parameters.currency} />
              <CheckoutStages data={data.data} />
            </>
          )}
        </Column>
      )}
    </LoadingPanel>
  );
}
