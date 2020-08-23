import React from 'react';
import MetricsTable from './MetricsTable';
import { deviceFilter } from 'lib/filters';

export default function DevicesTable({ websiteId, startDate, endDate, limit, onExpand }) {
  return (
    <MetricsTable
      title="Devices"
      type="device"
      metric="Visitors"
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={deviceFilter}
      onExpand={onExpand}
    />
  );
}
