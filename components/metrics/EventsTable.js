import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import Tag from 'components/common/Tag';
import DropDown from 'components/common/DropDown';
import { eventTypeFilter } from 'lib/filters';
import useDateRange from 'hooks/useDateRange';
import useFetch from 'hooks/useFetch';
import usePageQuery from 'hooks/usePageQuery';
import useShareToken from 'hooks/useShareToken';
import { TOKEN_HEADER } from 'lib/constants';
import styles from './EventsTable.module.css';

const EVENT_FILTER_DEFAULT = {
  value: 'EVENT_FILTER_DEFAULT',
  label: <FormattedMessage id="label.all-events" defaultMessage="All events" />,
};

export default function EventsTable({ websiteId, ...props }) {
  const [eventType, setEventType] = useState(EVENT_FILTER_DEFAULT.value);

  const {
    query: { url },
  } = usePageQuery();

  const shareToken = useShareToken();
  const [dateRange] = useDateRange(websiteId);

  const { startDate, endDate, modified } = dateRange;
  const { data, loading, error } = useFetch(
    `/api/website/${websiteId}/event-types`,
    {
      params: {
        start_at: +startDate,
        end_at: +endDate,
        url,
      },
      headers: { [TOKEN_HEADER]: shareToken?.token },
    },
    [modified],
  );

  const eventTypes = data ? [...new Set(data.map(({ x }) => x))] : [];
  const dropDownOptions = [EVENT_FILTER_DEFAULT, ...eventTypes.map(t => ({ value: t, label: t }))];

  return (
    <>
      {!loading && !error && eventTypes.length > 1 && (
        <div className={styles.filter}>
          <DropDown value={eventType} options={dropDownOptions} onChange={setEventType} />
        </div>
      )}
      <MetricsTable
        {...props}
        title={<FormattedMessage id="metrics.events" defaultMessage="Events" />}
        type="event"
        metric={<FormattedMessage id="metrics.actions" defaultMessage="Actions" />}
        websiteId={websiteId}
        dataFilter={eventTypeFilter}
        filterOptions={eventType === EVENT_FILTER_DEFAULT.value ? [] : [eventType]}
        renderLabel={({ x }) => <Label value={x} />}
      />
    </>
  );
}

const Label = ({ value }) => {
  const [event, label] = value.split('\t');
  return (
    <>
      <Tag>{event}</Tag>
      {label}
    </>
  );
};
