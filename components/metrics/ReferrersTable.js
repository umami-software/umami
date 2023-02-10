import { useState } from 'react';
import { useIntl } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterButtons from 'components/common/FilterButtons';
import FilterLink from 'components/common/FilterLink';
import { refFilter } from 'lib/filters';
import { labels } from 'components/messages';

const FILTER_COMBINED = 0;
const FILTER_RAW = 1;

export default function ReferrersTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage } = useIntl();

  const items = [
    {
      label: formatMessage(labels.filterCombined),
      value: FILTER_COMBINED,
    },
    { label: formatMessage(labels.filterRaw), value: FILTER_RAW },
  ];

  const renderLink = ({ w: link, x: referrer }) => {
    return referrer ? (
      <FilterLink id="referrer" value={referrer} externalUrl={link} />
    ) : (
      `(${formatMessage(labels.none)})`
    );
  };

  return (
    <>
      {showFilters && <FilterButtons items={items} selected={filter} onSelect={setFilter} />}
      <MetricsTable
        {...props}
        title={formatMessage(labels.referrers)}
        type="referrer"
        metric={formatMessage(labels.views)}
        websiteId={websiteId}
        dataFilter={filter !== FILTER_RAW ? refFilter : null}
        renderLabel={renderLink}
      />
    </>
  );
}
