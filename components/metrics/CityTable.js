import React from 'react';
import MetricsTable from './MetricsTable';
import { FormattedMessage } from 'react-intl';

export default function CityTable({ websiteId, ...props }) {
  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.city" defaultMessage="City" />}
      type="city"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
    />
  );
}
