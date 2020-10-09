import React from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import Tag from 'components/common/Tag';

export default function EventsTable({ websiteId, token, limit, onDataLoad }) {
  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.events" defaultMessage="Events" />}
      type="event"
      metric={<FormattedMessage id="metrics.actions" defaultMessage="Actions" />}
      websiteId={websiteId}
      token={token}
      limit={limit}
      renderLabel={({ x }) => <Label value={x} />}
      onDataLoad={onDataLoad}
    />
  );
}

const Label = ({ value }) => {
  const [event, label] = value.split(':');
  return (
    <>
      <Tag>{event}</Tag>
      {label}
    </>
  );
};
