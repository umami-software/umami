'use client';
import {
  Column,
  DataColumn,
  DataTable,
  Row,
  SearchField,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { DistributionBarChart } from '@/components/charts/DistributionBarChart';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useMessages, useSessionDataActivityStatsQuery } from '@/components/hooks';
import { CHART_COLORS, DATA_TYPE } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import type { PropertyFilter } from '@/lib/types';

type BreakdownMetric = 'sessions' | 'visits' | 'views' | 'events';

interface BreakdownRow {
  id: string;
  label: string;
  sessions: number;
  visits: number;
  views: number;
  events: number;
}

const METRIC_COLORS: Record<BreakdownMetric, string> = {
  sessions: CHART_COLORS[0],
  visits: CHART_COLORS[1],
  views: CHART_COLORS[2],
  events: CHART_COLORS[3],
};

export function SessionPropertyBreakdown({
  websiteId,
  propertyName,
  dataType,
  propertyFilters = [],
  onSelectValue,
}: {
  websiteId: string;
  propertyName: string;
  dataType?: number;
  propertyFilters?: PropertyFilter[];
  onSelectValue?: (value: string) => void;
}) {
  const [metric, setMetric] = useState<BreakdownMetric>('sessions');
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useSessionDataActivityStatsQuery(
    websiteId,
    propertyName,
    propertyFilters,
  );

  const metricOptions: { id: BreakdownMetric; label: string }[] = [
    { id: 'sessions', label: t(labels.visitors) },
    { id: 'visits', label: t(labels.visits) },
    { id: 'views', label: t(labels.views) },
    { id: 'events', label: t(labels.events) },
  ];

  const rows = useMemo<BreakdownRow[]>(() => {
    return (data ?? [])
      .map(row => ({
        id: row.label,
        label: row.label,
        sessions: Number(row.sessions ?? 0),
        visits: Number(row.visits ?? 0),
        views: Number(row.views ?? 0),
        events: Number(row.events ?? 0),
      }))
      .sort((a, b) => b[metric] - a[metric] || a.label.localeCompare(b.label));
  }, [data, metric]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(row => row.label.toLowerCase().includes(term));
  }, [rows, search]);

  const chartRows = useMemo(() => rows.filter(row => row[metric] > 0).slice(0, 10), [rows, metric]);
  const activeMetricLabel = metricOptions.find(option => option.id === metric)?.label ?? '';
  const canFilterValue = !!onSelectValue && dataType !== DATA_TYPE.date;

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="300px"
    >
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <Column gap="6" minWidth="0">
          <Panel gap="4">
            <Row justifyContent="space-between" alignItems="center" wrap="wrap" gap="3">
              <Text weight="bold">{activeMetricLabel}</Text>
              <Tabs value={metric} onValueChange={value => setMetric(value as BreakdownMetric)}>
                <TabsList>
                  {metricOptions.map(option => (
                    <TabsTrigger key={option.id} value={option.id}>
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </Row>
            {chartRows.length > 0 ? (
              <DistributionBarChart
                labels={chartRows.map(row => row.label)}
                datasets={[
                  {
                    label: activeMetricLabel,
                    values: chartRows.map(row => row[metric]),
                    backgroundColor: METRIC_COLORS[metric],
                  },
                ]}
                stacked={false}
              />
            ) : (
              <Empty />
            )}
          </Panel>
          <Column gap="4" minWidth="0">
            {rows.length > 10 && (
              <div style={{ width: '100%', maxWidth: 280 }}>
                <SearchField
                  value={search}
                  onSearch={setSearch}
                  delay={0}
                  placeholder={t(labels.search)}
                  className="w-full"
                />
              </div>
            )}
            <DataTable data={filteredRows} pageSize={20}>
              <DataColumn id="label" label={propertyName} width="minmax(180px, 2fr)">
                {(row: BreakdownRow) => (
                  <Row overflow="hidden" minWidth="0">
                    {canFilterValue ? (
                      <button
                        type="button"
                        onClick={() => onSelectValue(row.label)}
                        title={row.label}
                        className="truncate text-left font-medium hover:underline cursor-pointer"
                      >
                        {row.label}
                      </button>
                    ) : (
                      <Text truncate title={row.label}>
                        {row.label}
                      </Text>
                    )}
                  </Row>
                )}
              </DataColumn>
              <DataColumn
                id="sessions"
                label={t(labels.visitors)}
                align="end"
                width="110px"
                sortable
              >
                {(row: BreakdownRow) => formatLongNumber(row.sessions)}
              </DataColumn>
              <DataColumn id="visits" label={t(labels.visits)} align="end" width="110px" sortable>
                {(row: BreakdownRow) => formatLongNumber(row.visits)}
              </DataColumn>
              <DataColumn id="views" label={t(labels.views)} align="end" width="110px" sortable>
                {(row: BreakdownRow) => formatLongNumber(row.views)}
              </DataColumn>
              <DataColumn id="events" label={t(labels.events)} align="end" width="110px" sortable>
                {(row: BreakdownRow) => formatLongNumber(row.events)}
              </DataColumn>
            </DataTable>
          </Column>
        </Column>
      )}
    </LoadingPanel>
  );
}
