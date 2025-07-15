import { useMemo, useState } from 'react';
import {
  DataColumn,
  DataTable,
  Row,
  Loading,
  Column,
  ToggleGroup,
  ToggleGroupItem,
  Text,
} from '@umami/react-zen';
import {
  useEventDataPropertiesQuery,
  useEventDataValuesQuery,
  useMessages,
} from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PieChart } from '@/components/charts/PieChart';
import { CHART_COLORS } from '@/lib/constants';
import { ListTable } from '@/components/metrics/ListTable';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [eventName, setEventName] = useState('');
  const [propertyView, setPropertyView] = useState('table');

  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useEventDataPropertiesQuery(websiteId);
  const { data: values } = useEventDataValuesQuery(websiteId, eventName, propertyName);

  const propertySum = useMemo(() => {
    return values?.reduce((sum, { total }) => sum + total, 0) ?? 0;
  }, [values]);

  const chartData = useMemo(() => {
    if (!propertyName || !values) return null;
    return {
      labels: values.map(({ value }) => value),
      datasets: [
        {
          data: values.map(({ total }) => total),
          backgroundColor: CHART_COLORS,
          borderWidth: 0,
        },
      ],
    };
  }, [propertyName, values]);

  const tableData = useMemo(() => {
    if (!propertyName || !values || propertySum === 0) return [];
    return values.map(({ value, total }) => ({
      x: value,
      y: total,
      z: 100 * (total / propertySum),
    }));
  }, [propertyName, values, propertySum]);

  const handleRowClick = row => {
    setEventName(row.eventName);
    setPropertyName(row.propertyName);
  };

  return (
    <LoadingPanel isLoading={isLoading} isFetching={isFetching} data={data} error={error}>
      <Column>
        <DataTable data={data}>
          <DataColumn id="eventName" label={formatMessage(labels.name)}>
            {(row: any) => <Row onClick={() => handleRowClick(row)}>{row.eventName}</Row>}
          </DataColumn>
          <DataColumn id="propertyName" label={formatMessage(labels.property)}>
            {(row: any) => <Row onClick={() => handleRowClick(row)}>{row.propertyName}</Row>}
          </DataColumn>
          <DataColumn id="total" label={formatMessage(labels.count)} align="end" />
        </DataTable>
        {propertyName && (
          <Column>
            <Row gap justifyContent="space-between">
              <Text>{`${eventName}: ${propertyName}`}</Text>
              <ToggleGroup value={[propertyView]} onChange={value => setPropertyView(value[0])}>
                <ToggleGroupItem id="table">{formatMessage(labels.table)}</ToggleGroupItem>
                <ToggleGroupItem id="chart">{formatMessage(labels.chart)}</ToggleGroupItem>
              </ToggleGroup>
            </Row>

            {!values ? (
              <Loading icon="dots" />
            ) : propertyView === 'table' ? (
              <ListTable data={tableData} />
            ) : (
              <PieChart key={propertyName + eventName} type="doughnut" chartData={chartData} />
            )}
          </Column>
        )}
      </Column>
    </LoadingPanel>
  );
}
