import React, { useState } from 'react';
import MetricsTable from './MetricsTable';
import { refFilter } from 'lib/filters';
import ButtonGroup from '../common/ButtonGroup';

export default function Referrers({
  websiteId,
  websiteDomain,
  startDate,
  endDate,
  limit,
  onExpand = () => {},
}) {
  const [filter, setFilter] = useState('Combined');

  return (
    <MetricsTable
      title="Referrers"
      type="referrer"
      metric="Views"
      headerComponent={limit ? null : <FilterButtons selected={filter} onClick={setFilter} />}
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={refFilter}
      filterOptions={{
        domain: websiteDomain,
        domainOnly: filter === 'Domain only',
        raw: filter === 'Raw',
      }}
      onExpand={onExpand}
    />
  );
}

const FilterButtons = ({ selected, onClick }) => {
  return (
    <ButtonGroup
      size="xsmall"
      items={['Domain only', 'Combined', 'Raw']}
      selectedItem={selected}
      onClick={onClick}
    />
  );
};
