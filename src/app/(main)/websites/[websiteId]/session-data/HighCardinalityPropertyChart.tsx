'use client';
import { PieChart } from '@/components/charts/PieChart';
import { Empty } from '@/components/common/Empty';
import { useMessages, useMobile } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { CHART_COLORS } from '@/lib/constants';
import { formatLongNumber, formatShortTime } from '@/lib/format';
import type { PropertyLeaderboardRow } from '@/lib/types';
import { Column, DataColumn, DataTable, Grid, Row, Text } from '@umami/react-zen';
import { useMemo } from 'react';

export function HighCardinalityPropertyChart({ rows }: { rows: PropertyLeaderboardRow[] }) {
  const { t, labels } = useMessages();
  const { isPhone } = useMobile();
  const activeTable = useMemo(() => rows.filter(row => row.activity > 0).slice(0, 10), [rows]);
  const userMix = useMemo(() => {
    const totalNew = rows.reduce((sum, row) => sum + row.newSessions, 0);
    const totalReturning = rows.reduce((sum, row) => sum + row.returningSessions, 0);
    const total = totalNew + totalReturning;

    return {
      newCount: totalNew,
      returningCount: totalReturning,
      newRate: total ? (totalNew / total) * 100 : 0,
      returningRate: total ? (totalReturning / total) * 100 : 0,
    };
  }, [rows]);
  const sessionTypeTable = useMemo(() => {
    return [
      {
        label: 'New',
        count: userMix.newCount,
        percent: userMix.newRate,
      },
      {
        label: 'Returning',
        count: userMix.returningCount,
        percent: userMix.returningRate,
      },
    ].filter(row => row.count > 0);
  }, [userMix]);
  const sessionTypeChartData = useMemo(() => {
    if (!sessionTypeTable.length) return null;

    return {
      labels: sessionTypeTable.map(row => row.label),
      datasets: [
        {
          data: sessionTypeTable.map(row => row.count),
          backgroundColor: [CHART_COLORS[0], CHART_COLORS[1]],
          borderWidth: 0,
        },
      ],
    };
  }, [sessionTypeTable]);

  return (
    <Column gap="6">
      <Column minHeight="400px">
        <Grid columns="1fr" gap padding="2" alignItems="start">
          <Column gap padding="2">
            {activeTable.length === 0 ? (
              <Empty />
            ) : isPhone ? (
              <Column minWidth="0" width="100%">
                <DataTable data={activeTable} style={{ width: '100%' }}>
                <DataColumn
                  id="label"
                  label="Most Active"
                  width="1fr"
                  align="start"
                >
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
                      label="Most Active"
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
                    <DataColumn id="sessions" label="Visitors" align="end" width="90px">
                      {row => formatLongNumber(row.sessions)}
                    </DataColumn>
                    <DataColumn id="visits" label="Visits" align="end" width="90px">
                      {row => formatLongNumber(row.visits)}
                    </DataColumn>
                    <DataColumn id="views" label="Views" align="end" width="90px">
                      {row => formatLongNumber(row.views)}
                    </DataColumn>
                    <DataColumn id="events" label="Events" align="end" width="90px">
                      {row => formatLongNumber(row.events)}
                    </DataColumn>
                    <DataColumn id="duration" label="Duration" align="end" width="120px">
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
      <Column minHeight="300px">
        <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap padding="2" alignItems="start">
          <ListTable title="Users" metric={t(labels.count)} data={sessionTypeTable} />
          {sessionTypeChartData && <PieChart type="doughnut" chartData={sessionTypeChartData} />}
        </Grid>
      </Column>
    </Column>
  );
}
