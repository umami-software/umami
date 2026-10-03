import { Grid, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { type CommerceScope, useCommerceMetricsQuery, useMessages } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import type { CommerceMetricType } from '@/lib/commerce-reports';
import { currencyFormatter } from './commerceUtils';

const MAX_ROWS = 10;

export interface CommerceMetricsTableProps {
  websiteId: string;
  scope: CommerceScope;
  type: CommerceMetricType;
  title: string;
  enabled?: boolean;
  limit?: number;
}

/** Revenue by one dimension, as a share of revenue in the table. */
export function CommerceMetricsTable({
  websiteId,
  scope,
  type,
  title,
  enabled = true,
  limit = MAX_ROWS,
}: CommerceMetricsTableProps) {
  const { t } = useMessages();
  const { data, isLoading, isFetching, error } = useCommerceMetricsQuery(
    websiteId,
    { ...scope, type },
    { enabled },
  );

  const tableData = useMemo(() => {
    const total = (data || []).reduce((sum, { revenue }) => sum + revenue, 0);

    return (data || []).slice(0, limit).map(({ name, revenue, country }) => ({
      label: name,
      country,
      count: revenue,
      percent: total > 0 ? (revenue / total) * 100 : 0,
    }));
  }, [data, limit]);

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      minHeight="400px"
    >
      <Grid padding="2">
        {data && (
          <ListTable
            title={title}
            metric={t('commerce.revenue')}
            data={tableData}
            formatCount={currencyFormatter(scope.currency)}
            renderLabel={(row: any) => <CommerceMetricLabel type={type} data={row} />}
          />
        )}
      </Grid>
    </LoadingPanel>
  );
}

export function CommerceMetricLabel({ type, data }: { type: CommerceMetricType; data: any }) {
  const { t, labels } = useMessages();
  const { label } = data;

  if (type === 'channel') {
    return <Text>{labels[label] ? t(labels[label]) : label || t(labels.unknown)}</Text>;
  }

  if (type === 'market') {
    return <Text>{label || t(labels.unknown)}</Text>;
  }

  if (!label && type !== 'referrer') {
    return <Text color="muted">({t(labels.none)})</Text>;
  }

  return <MetricLabel type={type} data={data} />;
}
