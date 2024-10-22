import { useState } from 'react';
import { safeDecodeURI } from 'next-basics';
import FilterButtons from 'components/common/FilterButtons';
import { emptyFilter, paramFilter } from 'lib/filters';
import { FILTER_RAW, FILTER_COMBINED } from 'lib/constants';
import MetricsTable from './MetricsTable';
import useMessages from 'components/hooks/useMessages';
import styles from './QueryParametersTable.module.css';

const filters = {
  [FILTER_RAW]: emptyFilter,
  [FILTER_COMBINED]: [emptyFilter, paramFilter],
};

export function QueryParametersTable({ websiteId, showFilters, ...props }) {
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
            <div className={styles.item}>
              <div className={styles.param}>{safeDecodeURI(p)}</div>
              <div className={styles.value}>{safeDecodeURI(v)}</div>
            </div>
          )
        }
        delay={0}
      />
    </>
  );
}

export default QueryParametersTable;
