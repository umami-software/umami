import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import { refFilter } from 'lib/filters';
import ButtonGroup from 'components/common/ButtonGroup';
import { FILTER_DOMAIN_ONLY, FILTER_COMBINED, FILTER_RAW } from 'lib/constants';

export default function ReferrersTable({ websiteId, websiteDomain, limit, onExpand = () => {} }) {
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

  const renderLink = ({ x: url }) => {
    return url.startsWith('http') ? (
      <a href={url} target="_blank" rel="noreferrer">
        {decodeURI(url)}
      </a>
    ) : (
      decodeURI(url)
    );
  };

  return (
    <MetricsTable
      title={<FormattedMessage id="metrics.referrers" defaultMessage="Referrers" />}
      type="referrer"
      metric={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
      headerComponent={
        limit ? null : <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />
      }
      websiteId={websiteId}
      websiteDomain={websiteDomain}
      limit={limit}
      dataFilter={refFilter}
      filterOptions={{
        domain: websiteDomain,
        domainOnly: filter === FILTER_DOMAIN_ONLY,
        raw: filter === FILTER_RAW,
      }}
      onExpand={onExpand}
      renderLabel={renderLink}
    />
  );
}

const FilterButtons = ({ buttons, selected, onClick }) => {
  return <ButtonGroup size="xsmall" items={buttons} selectedItem={selected} onClick={onClick} />;
};
