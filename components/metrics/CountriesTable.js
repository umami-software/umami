import React from 'react';
import MetricsTable from './MetricsTable';
import { countryFilter, percentFilter } from 'lib/filters';

export default function CountriesTable({
  websiteId,
  startDate,
  endDate,
  limit,
  onDataLoad,
  onExpand,
}) {
  return (
    <MetricsTable
      title="Countries"
      type="country"
      metric="Visitors"
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={countryFilter}
      onDataLoad={data => onDataLoad(percentFilter(data))}
      onExpand={onExpand}
    />
  );
}
