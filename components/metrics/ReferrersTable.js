import React from 'react';
import MetricsTable from './MetricsTable';
import { refFilter } from 'lib/filters';

export default function Referrers({
  websiteId,
  websiteDomain,
  startDate,
  endDate,
  limit,
  onExpand = () => {},
}) {
  return (
    <MetricsTable
      title="Referrers"
      type="referrer"
      metric="Views"
      headerComponent={null}
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={refFilter}
      filterOptions={{ domain: websiteDomain }}
      onExpand={onExpand}
    />
  );
}
