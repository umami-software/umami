import { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { safeDecodeURI } from 'next-basics';
import Tag from 'components/common/Tag';
import FilterButtons from 'components/common/FilterButtons';
import { paramFilter } from 'lib/filters';
import MetricsTable from './MetricsTable';

const FILTER_COMBINED = 0;
const FILTER_RAW = 1;

const messages = defineMessages({
  combined: { id: 'metrics.filter.combined', defaultMessage: 'Combined' },
  raw: { id: 'metrics.filter.raw', defaultMessage: 'Raw' },
  views: { id: 'metrics.views', defaultMessage: 'Views' },
  none: { id: 'label.none', defaultMessage: 'None' },
  query: { id: 'metrics.query-parameters', defaultMessage: 'Query parameters' },
});

export default function QueryParametersTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage } = useIntl();

  const buttons = [
    {
      label: formatMessage(messages.combined),
      value: FILTER_COMBINED,
    },
    { label: formatMessage(messages.raw), value: FILTER_RAW },
  ];

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        {...props}
        title={formatMessage(messages.query)}
        type="query"
        metric={formatMessage(messages.views)}
        websiteId={websiteId}
        dataFilter={filter !== FILTER_RAW ? paramFilter : null}
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
