import React from 'react';
import MetricsTable from './MetricsTable';
import { deviceFilter } from 'lib/filters';

export default function DevicesTable({ websiteId, limit, onExpand }) {
  return (
    <MetricsTable
      title="Devices"
      type="device"
      metric="Visitors"
      websiteId={websiteId}
      limit={limit}
      dataFilter={deviceFilter}
      onExpand={onExpand}
    />
  );
}
