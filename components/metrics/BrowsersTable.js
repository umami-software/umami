import React from 'react';
import MetricsTable from './MetricsTable';
import { browserFilter } from 'lib/filters';

export default function BrowsersTable({ websiteId, limit, onExpand }) {
  return (
    <MetricsTable
      title="Browsers"
      type="browser"
      metric="Visitors"
      websiteId={websiteId}
      limit={limit}
      dataFilter={browserFilter}
      onExpand={onExpand}
    />
  );
}
