import React from 'react';
import MetricsTable from './MetricsTable';
import { FormattedMessage } from 'react-intl';

export default function ScreenTable({ websiteId, ...props }) {
  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.screens" defaultMessage="Screens" />}
      type="screen"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
    />
  );
}
