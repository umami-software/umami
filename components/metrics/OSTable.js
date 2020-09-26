import React from 'react';
import MetricsTable from './MetricsTable';
import { osFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';

export default function OSTable({ websiteId, token, limit }) {
  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.operating-systems" defaultMessage="Operating system" />}
      type="os"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      token={token}
      limit={limit}
      dataFilter={osFilter}
    />
  );
}
