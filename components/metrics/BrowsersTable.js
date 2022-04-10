import React from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import { browserFilter } from 'lib/filters';
import FilterLink from '../common/FilterLink';

export default function BrowsersTable({ websiteId, ...props }) {
  function renderLink({ x: browser }) {
    return <FilterLink id="browser" value={browser} />;
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.browsers" defaultMessage="Browsers" />}
      type="browser"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      dataFilter={browserFilter}
      renderLabel={renderLink}
    />
  );
}
