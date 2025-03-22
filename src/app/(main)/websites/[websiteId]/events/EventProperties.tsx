import { DataColumn, DataTable } from '@umami/react-zen';
import {
  useEventDataPropertiesQuery,
  useEventDataValuesQuery,
  useMessages,
} from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PieChart } from '@/components/charts/PieChart';
import { useState } from 'react';
import { CHART_COLORS } from '@/lib/constants';
import styles from './EventProperties.module.css';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [eventName, setEventName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useEventDataPropertiesQuery(websiteId);
  const { data: values } = useEventDataValuesQuery(websiteId, eventName, propertyName);
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

  const handleRowClick = row => {
    setEventName(row.eventName);
    setPropertyName(row.propertyName);
  };

  return (
    <LoadingPanel isLoading={isLoading} isFetched={isFetched} data={data} error={error}>
      <div className={styles.container}>
        <DataTable data={data} cardMode={false} className={styles.table}>
          <DataColumn name="eventName" label={formatMessage(labels.name)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.eventName}
              </div>
            )}
          </DataColumn>
          <DataColumn name="propertyName" label={formatMessage(labels.property)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.propertyName}
              </div>
            )}
          </DataColumn>
          <DataColumn name="total" label={formatMessage(labels.count)} alignment="end" />
        </DataTable>
        {propertyName && (
          <div className={styles.chart}>
            <div className={styles.title}>{propertyName}</div>
            <PieChart key={propertyName + eventName} type="doughnut" data={chartData} />
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}
