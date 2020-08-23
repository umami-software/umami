import React from 'react';
import MetricsTable from './MetricsTable';

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
      onExpand={onExpand}
    />
  );
}
