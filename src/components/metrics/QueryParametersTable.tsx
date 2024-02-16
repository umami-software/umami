import { useState } from 'react';
import { safeDecodeURI } from 'next-basics';
import FilterButtons from 'components/common/FilterButtons';
import { emptyFilter, paramFilter } from 'lib/filters';
import { FILTER_RAW, FILTER_COMBINED } from 'lib/constants';
import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { useMessages } from 'components/hooks';
import styles from './QueryParametersTable.module.css';

const filters = {
  [FILTER_RAW]: emptyFilter,
  [FILTER_COMBINED]: [emptyFilter, paramFilter],
};

export function QueryParametersTable({
  allowFilter,
  ...props
}: { allowFilter: boolean } & MetricsTableProps) {
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
    <MetricsTable
      {...props}
      title={formatMessage(labels.query)}
      type="query"
      metric={formatMessage(labels.views)}
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
    >
      {allowFilter && <FilterButtons items={buttons} selectedKey={filter} onSelect={setFilter} />}
    </MetricsTable>
  );
}

export default QueryParametersTable;
