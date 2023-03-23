import { useState } from 'react';
import { safeDecodeURI } from 'next-basics';
import Tag from 'components/common/Tag';
import FilterButtons from 'components/common/FilterButtons';
import { paramFilter } from 'lib/filters';
import { FILTER_RAW, FILTER_COMBINED } from 'lib/constants';
import MetricsTable from './MetricsTable';
import useMessages from 'hooks/useMessages';

const filters = {
  [FILTER_RAW]: null,
  [FILTER_COMBINED]: paramFilter,
};

export default function QueryParametersTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage, labels } = useMessages();

  const buttons = [
    {
      label: formatMessage(labels.filterCombined),
      key: FILTER_COMBINED,
    },
    { label: formatMessage(labels.filterRaw), key: FILTER_RAW },
  ];

  return (
    <>
      {showFilters && <FilterButtons items={buttons} selectedKey={filter} onSelect={setFilter} />}
      <MetricsTable
        {...props}
        title={formatMessage(labels.query)}
        type="query"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        dataFilter={filters[filter]}
        renderLabel={({ x, p, v }) =>
          filter === FILTER_RAW ? (
            x
          ) : (
            <>
              <Tag>{safeDecodeURI(p)}</Tag>
              {safeDecodeURI(v)}
            </>
          )
        }
        delay={0}
      />
    </>
  );
}
