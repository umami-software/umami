'use client';
import { DistributionBarChart } from '@/components/charts/DistributionBarChart';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages, useMobile, useSessionDataActivityStatsQuery } from '@/components/hooks';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import type { PropertyFilter } from '@/lib/types';
import { Column, DataColumn, DataTable, Grid, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';

export function SessionPropertyChart({
  websiteId,
  propertyName,
  propertyFilters = [],
}: {
  websiteId: string;
  propertyName: string;
  propertyFilters?: PropertyFilter[];
}) {
  const statsQuery = useSessionDataActivityStatsQuery(websiteId, propertyName, propertyFilters);
  const rows = statsQuery.data ?? [];
  const { t, labels } = useMessages();
  const { isPhone } = useMobile();
  const activeTable = useMemo(() => rows.filter(row => row.activity > 0).slice(0, 10), [rows]);
  const chartData = useMemo(
    () =>
      activeTable.map(row => ({
        label: row.label,
        values: {
          sessions: row.sessions,
          visits: row.visits,
          views: row.views,
          events: row.events,
        },
      })),
    [activeTable],
  );

  return (
    <LoadingPanel isLoading={statsQuery.isLoading} error={statsQuery.error} minHeight="300px">
      <Column gap="6">
        <Column minHeight="320px">
          {chartData.length ? (
            <Column gap="3">
              <Text weight="bold">{t(labels.activityByProperty)}</Text>
              <DistributionBarChart
                labels={chartData.map(row => row.label)}
                datasets={[
                  {
                    label: t(labels.visitors),
                    values: chartData.map(row => row.values.sessions),
                    backgroundColor: 'rgba(59, 130, 246, 0.80)',
                  },
                  {
                    label: t(labels.visits),
                    values: chartData.map(row => row.values.visits),
                    backgroundColor: 'rgba(16, 185, 129, 0.80)',
                  },
                  {
                    label: t(labels.views),
                    values: chartData.map(row => row.values.views),
                    backgroundColor: 'rgba(245, 158, 11, 0.80)',
                  },
                  {
                    label: t(labels.events),
                    values: chartData.map(row => row.values.events),
                    backgroundColor: 'rgba(244, 114, 182, 0.80)',
                  },
                ]}
                stacked={true}
              />
            </Column>
          ) : (
            <Empty />
          )}
        </Column>
        <Column>
          <Grid columns="1fr" gap padding="2" alignItems="start">
            <Column gap padding="2">
              {activeTable.length === 0 ? (
                <Empty />
              ) : isPhone ? (
                <Column minWidth="0" width="100%">
                  <DataTable data={activeTable} style={{ width: '100%' }}>
                    <DataColumn id="label" label={propertyName} width="1fr" align="start">
                      {row => (
                        <Row overflow="hidden" minWidth="0" width="100%">
                          <Text truncate style={{ maxWidth: '100%', width: '100%' }}>
                            {row.label}
                          </Text>
                        </Row>
                      )}
                    </DataColumn>
                  </DataTable>
                </Column>
              ) : (
                <Column overflow="auto" minHeight="0">
                  <Column style={{ minWidth: '700px' }}>
                    <DataTable data={activeTable}>
                      <DataColumn
                        id="label"
                        label={propertyName}
                        width="minmax(220px, 2fr)"
                        align="start"
                      >
                        {row => (
                          <Row overflow="hidden">
                            <Text truncate style={{ maxWidth: '320px' }}>
                              {row.label}
                            </Text>
                          </Row>
                        )}
                      </DataColumn>
                      <DataColumn id="sessions" label={t(labels.visitors)} align="end" width="90px">
                        {row => formatLongNumber(row.sessions)}
                      </DataColumn>
                      <DataColumn id="visits" label={t(labels.visits)} align="end" width="90px">
                        {row => formatLongNumber(row.visits)}
                      </DataColumn>
                      <DataColumn id="views" label={t(labels.views)} align="end" width="90px">
                        {row => formatLongNumber(row.views)}
                      </DataColumn>
                      <DataColumn id="events" label={t(labels.events)} align="end" width="90px">
                        {row => formatLongNumber(row.events)}
                      </DataColumn>
                      <DataColumn
                        id="duration"
                        label={t(labels.duration)}
                        align="end"
                        width="120px"
                      >
                        {row =>
                          formatShortTime(Math.abs(~~Number(row.totaltime)), ['h', 'm', 's'], ' ')
                        }
                      </DataColumn>
                    </DataTable>
                  </Column>
                </Column>
              )}
            </Column>
          </Grid>
        </Column>
      </Column>
    </LoadingPanel>
  );
}
