import { GridColumn, GridTable } from 'react-basics';
import { useSessionDataProperties, useSessionDataValues, useMessages } from 'components/hooks';
import { LoadingPanel } from 'components/common/LoadingPanel';
import PieChart from 'components/charts/PieChart';
import { useState } from 'react';
import { CHART_COLORS } from 'lib/constants';
import styles from './SessionProperties.module.css';

export function SessionProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useSessionDataProperties(websiteId);
  const { data: values } = useSessionDataValues(websiteId, propertyName);
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
          <GridColumn name="total" label={formatMessage(labels.count)} alignment="end" />
        </GridTable>
        {propertyName && (
          <div className={styles.chart}>
            <div className={styles.title}>{propertyName}</div>
            <PieChart key={propertyName} type="doughnut" data={chartData} />
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}

export default SessionProperties;
