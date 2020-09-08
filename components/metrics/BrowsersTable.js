import React from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import { browserFilter } from 'lib/filters';

export default function BrowsersTable({ websiteId, limit, onExpand }) {
  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.browsers" defaultMessage="Browsers" />}
      type="browser"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      limit={limit}
      dataFilter={browserFilter}
      onExpand={onExpand}
    />
  );
}
