import { useMemo, useState } from 'react';
import { Select, ListItem, Grid, Column } from '@umami/react-zen';
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

  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useEventDataPropertiesQuery(websiteId);

  const events: string[] = data
    ? data.reduce((arr: string | any[], e: { eventName: any }) => {
        return !arr.includes(e.eventName) ? arr.concat(e.eventName) : arr;
      }, [])
    : [];
  const properties: string[] = eventName
    ? data?.filter(e => e.eventName === eventName).map(e => e.propertyName)
    : [];

  return (
    <LoadingPanel
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="300px"
    >
      <Column gap="6">
        {data && (
          <Grid columns="repeat(auto-fill, minmax(300px, 1fr))" marginBottom="3" gap>
            <Select
              label={formatMessage(labels.event)}
              value={eventName}
              onChange={setEventName}
              placeholder=""
            >
              {events?.map(p => (
                <ListItem key={p} id={p}>
                  {p}
                </ListItem>
              ))}
            </Select>
            <Select
              label={formatMessage(labels.property)}
              value={propertyName}
              onChange={setPropertyName}
              isDisabled={!eventName}
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
        {eventName && propertyName && (
          <EventValues websiteId={websiteId} eventName={eventName} propertyName={propertyName} />
        )}
      </Column>
    </LoadingPanel>
  );
}

const EventValues = ({ websiteId, eventName, propertyName }) => {
  const {
    data: values,
    isLoading,
    isFetching,
    error,
  } = useEventDataValuesQuery(websiteId, eventName, propertyName);

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
      label: value,
      count: total,
      percent: 100 * (total / propertySum),
    }));
  }, [propertyName, values, propertySum]);

  return (
    <LoadingPanel
      isLoading={isLoading}
      isFetching={isFetching}
      data={values}
      error={error}
      minHeight="300px"
      gap="6"
    >
      {values && (
        <Grid columns="1fr 1fr" gap>
          <ListTable title={propertyName} data={tableData} />
          <PieChart type="doughnut" chartData={chartData} />
        </Grid>
      )}
    </LoadingPanel>
  );
};
