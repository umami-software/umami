import React from 'react';
import MetricsTable from './MetricsTable';
import styles from './EventsTable.module.css';

export default function DevicesTable({
  websiteId,
  startDate,
  endDate,
  limit,
  onExpand,
  onDataLoad,
}) {
  return (
    <MetricsTable
      title="Events"
      type="event"
      metric="Actions"
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      renderLabel={({ w, x }) => (
        <>
          <span className={styles.type}>{w}</span>
          {x}
        </>
      )}
      onExpand={onExpand}
      onDataLoad={onDataLoad}
    />
  );
}
