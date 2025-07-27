import { useMemo } from 'react';
import { GridColumn, GridTable, Flexbox, Button, ButtonGroup, Loading } from 'react-basics';
import { useEventDataProperties, useEventDataValues, useMessages } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import PieChart from '@/components/charts/PieChart';
import ListTable from '@/components/metrics/ListTable';
import { useState } from 'react';
import { CHART_COLORS } from '@/lib/constants';
import styles from './EventProperties.module.css';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [eventName, setEventName] = useState('');
  const [propertyView, setPropertyView] = useState('table');

  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useEventDataProperties(websiteId);
  const { data: values } = useEventDataValues(websiteId, eventName, propertyName);

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
    <LoadingPanel isLoading={isLoading} isFetched={isFetched} data={data} error={error}>
      <div className={styles.container}>
        <GridTable data={data} cardMode={false} className={styles.table}>
          <GridColumn name="eventName" label={formatMessage(labels.name)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.eventName}
              </div>
            )}
          </GridColumn>
          <GridColumn name="propertyName" label={formatMessage(labels.property)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.propertyName}
              </div>
            )}
          </GridColumn>
          <GridColumn name="total" label={formatMessage(labels.count)} alignment="end" />
        </GridTable>
        {propertyName && (
          <div className={styles.data}>
            <Flexbox className={styles.header} gap={12} justifyContent="space-between">
              <div className={styles.title}>{`${eventName}: ${propertyName}`}</div>
              <ButtonGroup
                selectedKey={propertyView}
                onSelect={key => setPropertyView(key as string)}
              >
                <Button key="table">{formatMessage(labels.table)}</Button>
                <Button key="chart">{formatMessage(labels.chart)}</Button>
              </ButtonGroup>
            </Flexbox>

            {!values ? (
              <Loading icon="dots" />
            ) : propertyView === 'table' ? (
              <ListTable data={tableData} />
            ) : (
              <PieChart key={propertyName + eventName} type="doughnut" data={chartData} />
            )}
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}

export default EventProperties;
