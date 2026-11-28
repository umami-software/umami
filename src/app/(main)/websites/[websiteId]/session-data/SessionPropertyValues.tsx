'use client';
import { Column, DataColumn, DataTable, Grid, Row, SearchField, Text } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { PieChart } from '@/components/charts/PieChart';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { PercentageBar } from '@/components/common/PercentageBar';
import { useMessages, useSessionDataActivityStatsQuery } from '@/components/hooks';
import { PropertyDateChart } from '@/components/property-data/PropertyDateChart';
import { PropertyNumericChart } from '@/components/property-data/PropertyNumericChart';
import { CHART_COLORS, DATA_TYPE } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import type { PropertyFilter } from '@/lib/types';

const MAX_CHART_SLICES = 10;

interface ValueRow {
  id: string;
  label: string;
  sessions: number;
  percent: number;
}

export function SessionPropertyValues({
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
  if (dataType === DATA_TYPE.number) {
    return (
      <PropertyNumericChart
        source="session"
        websiteId={websiteId}
        propertyName={propertyName}
        propertyFilters={propertyFilters}
      />
    );
  }

  if (dataType === DATA_TYPE.date) {
    return (
      <PropertyDateChart
        source="session"
        websiteId={websiteId}
        propertyName={propertyName}
        propertyFilters={propertyFilters}
      />
    );
  }

  return (
    <SessionPropertyValueList
      websiteId={websiteId}
      propertyName={propertyName}
      propertyFilters={propertyFilters}
      onSelectValue={onSelectValue}
    />
  );
}

function SessionPropertyValueList({
  websiteId,
  propertyName,
  propertyFilters = [],
  onSelectValue,
}: {
  websiteId: string;
  propertyName: string;
  propertyFilters?: PropertyFilter[];
  onSelectValue?: (value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useSessionDataActivityStatsQuery(
    websiteId,
    propertyName,
    propertyFilters,
  );

  const { rows, totalSessions } = useMemo(() => {
    const raw = (data ?? [])
      .map(row => ({
        label: row.label,
        sessions: Number(row.sessions ?? 0),
      }))
      .filter(row => row.sessions > 0)
      .sort((a, b) => b.sessions - a.sessions || a.label.localeCompare(b.label));

    const total = raw.reduce((sum, row) => sum + row.sessions, 0);
    const items: ValueRow[] = raw.map(row => ({
      id: row.label,
      label: row.label,
      sessions: row.sessions,
      percent: total > 0 ? (row.sessions / total) * 100 : 0,
    }));

    return { rows: items, totalSessions: total };
  }, [data]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(row => row.label.toLowerCase().includes(term));
  }, [rows, search]);

  // High-cardinality properties (like email/userId) are mostly 1-to-1 with visitors, so a
  // doughnut chart adds visual noise instead of insight.
  const showChart =
    rows.length > 0 && !(rows.length > MAX_CHART_SLICES && rows.length / totalSessions > 0.7);

  const pieChartData = useMemo(() => {
    if (!showChart) return null;

    const top = rows.slice(0, MAX_CHART_SLICES);
    const otherTotal = rows.slice(MAX_CHART_SLICES).reduce((sum, row) => sum + row.sessions, 0);
    const slices =
      otherTotal > 0 ? [...top, { label: t(labels.other), sessions: otherTotal }] : top;

    return {
      labels: slices.map(item => item.label),
      datasets: [
        {
          data: slices.map(item => item.sessions),
          backgroundColor: slices.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [rows, showChart, t, labels.other]);

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
        <Grid
          columns={{ base: '1fr', lg: showChart ? '3fr 2fr' : '1fr' }}
          gap="6"
          alignItems="start"
        >
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
              <DataColumn id="label" label={propertyName} width="minmax(160px, 2fr)">
                {(row: ValueRow) => (
                  <Row overflow="hidden" minWidth="0">
                    {onSelectValue ? (
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
              <DataColumn id="percent" label="%" align="center" width="minmax(120px, 1fr)">
                {(row: ValueRow) => <PercentageBar value={row.percent} />}
              </DataColumn>
              <DataColumn id="sessions" label={t(labels.visitors)} align="end" width="100px">
                {(row: ValueRow) => formatLongNumber(row.sessions)}
              </DataColumn>
            </DataTable>
          </Column>
          {pieChartData && (
            <Panel>
              <PieChart type="doughnut" chartData={pieChartData} height="320px" />
            </Panel>
          )}
        </Grid>
      )}
    </LoadingPanel>
  );
}
