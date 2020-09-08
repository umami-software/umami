import React from 'react';
import MetricsTable from './MetricsTable';
import { osFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';

export default function OSTable({ websiteId, limit, onExpand }) {
  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.operating-system" defaultMessage="Operating system" />}
      type="os"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      limit={limit}
      dataFilter={osFilter}
      onExpand={onExpand}
    />
  );
}
