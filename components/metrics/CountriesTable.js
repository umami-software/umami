import React from 'react';
import MetricsTable from './MetricsTable';
import { countryFilter, percentFilter } from 'lib/filters';
import { FormattedMessage } from 'react-intl';

export default function CountriesTable({ websiteId, token, limit, onDataLoad = () => {} }) {
  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.countries" defaultMessage="Countries" />}
      type="country"
      metric={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
      websiteId={websiteId}
      token={token}
      limit={limit}
      dataFilter={countryFilter}
      onDataLoad={data => onDataLoad(percentFilter(data))}
    />
  );
}
