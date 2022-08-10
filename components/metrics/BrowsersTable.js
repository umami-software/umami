import React from 'react';
import { FormattedMessage } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import MetricsTable from 'components/metrics/MetricsTable';
import { BROWSERS } from 'lib/constants';

export default function BrowsersTable({ websiteId, ...props }) {
  function renderLink({ x: browser }) {
    return <FilterLink id="browser" value={browser} label={BROWSERS[browser] || browser} />;
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.browsers" defaultMessage="Browsers" />}
      type="browser"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      renderLabel={renderLink}
    />
  );
}
