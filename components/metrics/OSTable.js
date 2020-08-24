import React from 'react';
import MetricsTable from './MetricsTable';
import { osFilter } from 'lib/filters';

export default function OSTable({ websiteId, startDate, endDate, limit, onExpand }) {
  return (
    <MetricsTable
      title="Operating System"
      type="os"
      metric="Visitors"
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={osFilter}
      onExpand={onExpand}
    />
  );
}
