import { DataColumn, DataTable, Row } from '@umami/react-zen';
import { useMemo } from 'react';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useWebsiteMetricsQuery } from '@/components/hooks';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { percentFilter } from '@/lib/filters';

/** Each event's count and share of all events, with the name linking to a filter. */
export function EventCountsTable({ websiteId, limit }: { websiteId: string; limit?: number }) {
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(websiteId, {
    type: 'event',
    limit,
  });

  const rows = useMemo(
    () =>
      percentFilter(data as any[]).map(({ x, y, z }) => ({
        id: x,
        label: x,
        count: y,
        percent: z,
      })),
    [data],
  );

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="300px"
    >
      <DataTable data={rows}>
        <DataColumn id="label" label={t(labels.event)} width="minmax(200px, 1fr)">
          {(row: any) => (
            <Row overflow="hidden">
              <MetricLabel type="event" data={row} />
            </Row>
          )}
        </DataColumn>
        <DataColumn id="count" label={t(labels.count)} align="end" width="120px">
          {(row: any) => row.count.toLocaleString()}
        </DataColumn>
        <DataColumn id="percent" label="%" align="end" width="100px">
          {(row: any) => `${Math.round(row.percent)}%`}
        </DataColumn>
      </DataTable>
    </LoadingPanel>
  );
}
