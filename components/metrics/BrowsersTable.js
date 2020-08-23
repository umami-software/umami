import React from 'react';
import MetricsTable from './MetricsTable';
import { browserFilter } from 'lib/filters';

export default function BrowsersTable({ websiteId, startDate, endDate, limit, onExpand }) {
  return (
    <MetricsTable
      title="Browsers"
      type="browser"
      metric="Visitors"
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={browserFilter}
      onExpand={onExpand}
    />
  );
}
