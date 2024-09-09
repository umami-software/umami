import { GridColumn, GridTable } from 'react-basics';
import { useEventDataProperties, useEventDataValues, useMessages } from 'components/hooks';
import { LoadingPanel } from 'components/common/LoadingPanel';
import PieChart from 'components/charts/PieChart';
import { useState } from 'react';
import { CHART_COLORS } from 'lib/constants';
import styles from './EventProperties.module.css';
import { useIntl } from 'react-intl';
import { formatLongNumberOptions } from 'lib/format';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const intl = useIntl();
  const [propertyName, setPropertyName] = useState('');
  const [eventName, setEventName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useEventDataProperties(websiteId);
  const { data: values } = useEventDataValues(websiteId, eventName, propertyName);
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
          <GridColumn name="total" label={formatMessage(labels.count)} alignment="end">
            {row => (
              <span title={intl.formatNumber(row.total)}>
                {intl.formatNumber(row.total, formatLongNumberOptions(row.total))}
              </span>
            )}
          </GridColumn>
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

export default EventProperties;
