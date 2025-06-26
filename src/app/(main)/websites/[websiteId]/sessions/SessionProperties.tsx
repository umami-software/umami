import { Grid, DataColumn, DataTable } from '@umami/react-zen';
import {
  useSessionDataPropertiesQuery,
  useSessionDataValuesQuery,
  useMessages,
} from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PieChart } from '@/components/charts/PieChart';
import { useState } from 'react';
import { CHART_COLORS } from '@/lib/constants';

export function SessionProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useSessionDataPropertiesQuery(websiteId);
  const { data: values } = useSessionDataValuesQuery(websiteId, propertyName);
  const chartData =
    propertyName && values
      ? {
          labels: values.map(({ value }) => value),
          datasets: [
            {
              data: values.map(({ total }) => total),
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        }
      : null;

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      <Grid>
        <DataTable data={data}>
          <DataColumn id="propertyName" label={formatMessage(labels.property)}>
            {(row: any) => (
              <div onClick={() => setPropertyName(row.propertyName)}>{row.propertyName}</div>
            )}
          </DataColumn>
          <DataColumn id="total" label={formatMessage(labels.count)} align="end" />
        </DataTable>
        {propertyName && (
          <div>
            <div>{propertyName}</div>
            <PieChart key={propertyName} type="doughnut" chartData={chartData} />
          </div>
        )}
      </Grid>
    </LoadingPanel>
  );
}
