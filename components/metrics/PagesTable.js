import React, { useState } from 'react';
import MetricsTable from './MetricsTable';
import { urlFilter } from 'lib/filters';
import ButtonGroup from '../common/ButtonGroup';

export default function PagesTable({
  websiteId,
  websiteDomain,
  startDate,
  endDate,
  limit,
  onExpand,
}) {
  const [filter, setFilter] = useState('Combined');

  return (
    <MetricsTable
      title="Pages"
      type="url"
      metric="Views"
      headerComponent={limit ? null : <FilterButtons selected={filter} onClick={setFilter} />}
      websiteId={websiteId}
      startDate={startDate}
      endDate={endDate}
      limit={limit}
      dataFilter={urlFilter}
      filterOptions={{ domain: websiteDomain, raw: filter === 'Raw' }}
      renderLabel={({ x }) => decodeURI(x)}
      onExpand={onExpand}
    />
  );
}

const FilterButtons = ({ selected, onClick }) => {
  return (
    <ButtonGroup
      size="xsmall"
      items={['Combined', 'Raw']}
      selectedItem={selected}
      onClick={onClick}
    />
  );
};
