import React from 'react';
import MetricsTable from './MetricsTable';
import { FormattedMessage } from 'react-intl';

export default function RegionTable({ websiteId, ...props }) {
  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.region" defaultMessage="Region" />}
      type="region"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
    />
  );
}
