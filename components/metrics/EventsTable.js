import React from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import Tag from 'components/common/Tag';

export default function EventsTable({ websiteId, ...props }) {
  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.events" defaultMessage="Events" />}
      type="event"
      metric={<FormattedMessage id="metrics.actions" defaultMessage="Actions" />}
      websiteId={websiteId}
      renderLabel={({ x }) => <Label value={x} />}
    />
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
