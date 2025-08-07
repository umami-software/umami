import { useState } from 'react';
import { Row, Text } from '@umami/react-zen';
import { FilterButtons } from '@/components/input/FilterButtons';
import { emptyFilter, paramFilter } from '@/lib/filters';
import { MetricsTable, MetricsTableProps } from './MetricsTable';
import { useMessages } from '@/components/hooks';

const FILTER_COMBINED = 'filter-combined';
const FILTER_RAW = 'filter-raw';

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
      id: FILTER_COMBINED,
      label: formatMessage(labels.filterCombined),
    },
    { id: FILTER_RAW, label: formatMessage(labels.filterRaw) },
  ];

  const renderLabel = ({ x, p, v }) => {
    return (
      <Row alignItems="center" maxWidth="600px" gap>
        {filter === FILTER_RAW ? (
          <Text truncate title={x}>
            {x}
          </Text>
        ) : (
          <>
            <Text color="primary" weight="bold">
              {p}
            </Text>
            <Text truncate title={v}>
              {v}
            </Text>
          </>
        )}
      </Row>
    );
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.query)}
      type="query"
      metric={formatMessage(labels.views)}
      dataFilter={filters[filter]}
      renderLabel={renderLabel}
      delay={0}
    >
      {allowFilter && <FilterButtons items={buttons} value={filter} onChange={setFilter} />}
    </MetricsTable>
  );
}
