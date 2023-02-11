import { useState } from 'react';
import { useIntl } from 'react-intl';
import FilterLink from 'components/common/FilterLink';
import FilterButtons from 'components/common/FilterButtons';
import { urlFilter } from 'lib/filters';
import { labels } from 'components/messages';
import MetricsTable from './MetricsTable';
import { FILTER_COMBINED, FILTER_RAW } from 'lib/constants';

const filters = {
  [FILTER_RAW]: null,
  [FILTER_COMBINED]: urlFilter,
};

export default function PagesTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage } = useIntl();

  const buttons = [
    {
      label: formatMessage(labels.filterCombined),
      key: FILTER_COMBINED,
    },
    {
      label: formatMessage(labels.filterRaw),
      key: FILTER_RAW,
    },
  ];

  const renderLink = ({ x: url }) => {
    return <FilterLink id="url" value={url} />;
  };

  return (
    <>
      {showFilters && <FilterButtons items={buttons} selectedKey={filter} onSelect={setFilter} />}
      <MetricsTable
        title={formatMessage(labels.pages)}
        type="url"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        dataFilter={filters[filter]}
        renderLabel={renderLink}
        {...props}
      />
    </>
  );
}
