import React from 'react';
import MetricsTable from './MetricsTable';
import { osFilter } from 'lib/filters';

export default function OSTable({ websiteId, limit, onExpand }) {
  return (
    <MetricsTable
      title="Operating System"
      type="os"
      metric="Visitors"
      websiteId={websiteId}
      limit={limit}
      dataFilter={osFilter}
      onExpand={onExpand}
    />
  );
}
