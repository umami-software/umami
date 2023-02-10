import { useState } from 'react';
import { useIntl } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import FilterButtons from 'components/common/FilterButtons';
import { urlFilter } from 'lib/filters';
import { labels } from 'components/messages';
import MetricsTable from './MetricsTable';

export const FILTER_COMBINED = 0;
export const FILTER_RAW = 1;

export default function PagesTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage } = useIntl();

  const buttons = [
    {
      label: formatMessage(labels.filterCombined),
      value: FILTER_COMBINED,
    },
    {
      label: formatMessage(labels.filterRaw),
      value: FILTER_RAW,
    },
  ];

  const renderLink = ({ x: url }) => {
    return <FilterLink id="url" value={url} />;
  };

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        title={formatMessage(labels.pages)}
        type="url"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        dataFilter={filter !== FILTER_RAW ? urlFilter : null}
        renderLabel={renderLink}
        {...props}
      />
    </>
  );
}
