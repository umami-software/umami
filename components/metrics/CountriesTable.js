import React from 'react';
import MetricsTable from './MetricsTable';
import { countryFilter, percentFilter } from 'lib/filters';

export default function CountriesTable({ websiteId, limit, onDataLoad = () => {}, onExpand }) {
  return (
    <MetricsTable
      title="Countries"
      type="country"
      metric="Visitors"
      websiteId={websiteId}
      limit={limit}
      dataFilter={countryFilter}
      onDataLoad={data => onDataLoad(percentFilter(data))}
      onExpand={onExpand}
    />
  );
}
