import { useMemo, useState } from 'react';
import { Select, ListItem, Grid, Column } from '@umami/react-zen';
import {
  useMessages,
  useSessionDataPropertiesQuery,
  useSessionDataValuesQuery,
} from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PieChart } from '@/components/charts/PieChart';
import { CHART_COLORS } from '@/lib/constants';
import { ListTable } from '@/components/metrics/ListTable';

export function SessionProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useSessionDataPropertiesQuery(websiteId);

  const properties: string[] = data?.map(e => e.propertyName);

  return (
    <LoadingPanel
      isLoading={isLoading}
      isFetching={isFetching}
      data={data}
      error={error}
      minHeight="300px"
    >
      <Column gap="6">
        {data && (
          <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" gap>
            <Select
              label={formatMessage(labels.event)}
              value={propertyName}
              onChange={setPropertyName}
              placeholder=""
            >
              {properties?.map(p => (
                <ListItem key={p} id={p}>
                  {p}
                </ListItem>
              ))}
            </Select>
          </Grid>
        )}
        {propertyName && <SessionValues websiteId={websiteId} propertyName={propertyName} />}
      </Column>
    </LoadingPanel>
  );
}

const SessionValues = ({ websiteId, propertyName }) => {
  const { data, isLoading, isFetching, error } = useSessionDataValuesQuery(websiteId, propertyName);

  const propertySum = useMemo(() => {
    return data?.reduce((sum, { total }) => sum + total, 0) ?? 0;
  }, [data]);

  const chartData = useMemo(() => {
    if (!propertyName || !data) return null;
    return {
      labels: data.map(({ value }) => value),
      datasets: [
        {
          data: data.map(({ total }) => total),
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
        },
      ],
    };
  }, [propertyName, data]);

  const tableData = useMemo(() => {
    if (!propertyName || !data || propertySum === 0) return [];
    return data.map(({ value, total }) => ({
      label: value,
      count: total,
      percent: 100 * (total / propertySum),
    }));
  }, [propertyName, data, propertySum]);

  return (
    <LoadingPanel
      isLoading={isLoading}
      isFetching={isFetching}
      data={data}
      error={error}
      minHeight="300px"
    >
      {data && (
        <Grid columns="1fr 1fr" gap>
          <ListTable title={propertyName} data={tableData} />
          <PieChart type="doughnut" chartData={chartData} />
        </Grid>
      )}
    </LoadingPanel>
  );
};
