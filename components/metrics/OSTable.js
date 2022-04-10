import React from 'react';
import MetricsTable from './MetricsTable';
import { FormattedMessage } from 'react-intl';
import FilterLink from 'components/common/FilterLink';

export default function OSTable({ websiteId, ...props }) {
  function renderLink({ x: os }) {
    return <FilterLink id="os" value={os} />;
  }

  return (
    <MetricsTable
      {...props}
      title={<FormattedMessage id="metrics.operating-systems" defaultMessage="Operating system" />}
      type="os"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      renderLabel={renderLink}
      websiteId={websiteId}
    />
  );
}
