import React from 'react';
import MetricsTable from './MetricsTable';
import { urlFilter } from 'lib/filters';

export default function PagesTable({
  websiteId,
  websiteDomain,
  startDate,
  endDate,
  limit,
  onExpand,
}) {
  return (
    <MetricsTable
      title="Pages"
      type="url"
      metric="Views"
      headerComponent={null}
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={urlFilter}
      filterOptions={{ domain: websiteDomain }}
      onExpand={onExpand}
    />
  );
}
