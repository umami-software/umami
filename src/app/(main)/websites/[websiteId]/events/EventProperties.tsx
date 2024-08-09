import { GridColumn, GridTable } from 'react-basics';
import { useEventDataProperties, useEventDataValues, useMessages } from 'components/hooks';
import { LoadingPanel } from 'components/common/LoadingPanel';
import styles from './EventProperties.module.css';
import PieChart from 'components/charts/PieChart';
import { useState } from 'react';
import { CHART_COLORS } from 'lib/constants';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useEventDataProperties(websiteId);
  const { data: values } = useEventDataValues(websiteId, propertyName);
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
    <LoadingPanel isLoading={isLoading} isFetched={isFetched} data={data} error={error}>
      <div className={styles.container}>
        <GridTable data={data} cardMode={false} className={styles.table}>
          <GridColumn name="propertyName" label={formatMessage(labels.property)}>
            {row => (
              <div className={styles.link} onClick={() => setPropertyName(row.propertyName)}>
                {row.propertyName}
              </div>
            )}
          </GridColumn>
          <GridColumn name="total" label={formatMessage(labels.count)} />
        </GridTable>
        {propertyName && (
          <div>
            <strong>{propertyName}</strong>
            <PieChart key={propertyName} type="doughnut" data={chartData} />
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}

export default EventProperties;
