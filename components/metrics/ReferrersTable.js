import React, { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterButtons from 'components/common/FilterButtons';
import FilterLink from 'components/common/FilterLink';
import { refFilter } from 'lib/filters';

export const FILTER_COMBINED = 0;
export const FILTER_RAW = 1;

const messages = defineMessages({
  combined: { id: 'metrics.filter.combined', defaultMessage: 'Combined' },
  raw: { id: 'metrics.filter.raw', defaultMessage: 'Raw' },
  referrers: { id: 'metrics.referrers', defaultMessage: 'Referrers' },
  views: { id: 'metrics.views', defaultMessage: 'Views' },
  none: { id: 'label.none', defaultMessage: 'None' },
});

export default function ReferrersTable({ websiteId, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const { formatMessage } = useIntl();
  const none = formatMessage(messages.none);

  const buttons = [
    {
      label: formatMessage(messages.combined),
      value: FILTER_COMBINED,
    },
    { label: formatMessage(messages.raw), value: FILTER_RAW },
  ];

  const renderLink = ({ w: link, x: referrer }) => {
    return referrer ? (
      <FilterLink id="referrer" value={referrer} externalUrl={link} />
    ) : (
      `(${none})`
    );
  };

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        {...props}
        title={formatMessage(messages.referrers)}
        type="referrer"
        metric={formatMessage(messages.views)}
        websiteId={websiteId}
        dataFilter={filter !== FILTER_RAW ? refFilter : null}
        renderLabel={renderLink}
      />
    </>
  );
}
