import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterButtons from 'components/common/FilterButtons';
import { refFilter } from 'lib/filters';

export const FILTER_DOMAIN_ONLY = 0;
export const FILTER_COMBINED = 1;
export const FILTER_RAW = 2;

export default function ReferrersTable({ websiteId, websiteDomain, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);

  const buttons = [
    {
      label: <FormattedMessage id="metrics.filter.domain-only" defaultMessage="Domain only" />,
      value: FILTER_DOMAIN_ONLY,
    },
    {
      label: <FormattedMessage id="metrics.filter.combined" defaultMessage="Combined" />,
      value: FILTER_COMBINED,
    },
    { label: <FormattedMessage id="metrics.filter.raw" defaultMessage="Raw" />, value: FILTER_RAW },
  ];

  const renderLink = ({ w: href, x: url }) => {
    return (href || url).startsWith('http') ? (
      <a href={href || url} target="_blank" rel="noreferrer">
        {decodeURI(url)}
      </a>
    ) : (
      decodeURI(url)
    );
  };

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        {...props}
        title={<FormattedMessage id="metrics.referrers" defaultMessage="Referrers" />}
        type="referrer"
        metric={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
        websiteId={websiteId}
        websiteDomain={websiteDomain}
        dataFilter={refFilter}
        filterOptions={{
          domain: websiteDomain,
          domainOnly: filter === FILTER_DOMAIN_ONLY,
          raw: filter === FILTER_RAW,
        }}
        renderLabel={renderLink}
      />
    </>
  );
}
