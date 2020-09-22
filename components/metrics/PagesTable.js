import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ButtonGroup from 'components/common/ButtonGroup';
import { urlFilter } from 'lib/filters';
import { FILTER_COMBINED, FILTER_RAW } from 'lib/constants';
import MetricsTable from './MetricsTable';
import ButtonLayout from '../layout/ButtonLayout';

export default function PagesTable({ websiteId, token, websiteDomain, limit, onExpand }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);

  const buttons = [
    {
      label: <FormattedMessage id="metrics.filter.combined" defaultMessage="Combined" />,
      value: FILTER_COMBINED,
    },
    { label: <FormattedMessage id="metrics.filter.raw" defaultMessage="Raw" />, value: FILTER_RAW },
  ];

  return (
    <>
      {!limit && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        title={<FormattedMessage id="metrics.pages" defaultMessage="Pages" />}
        type="url"
        metric={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
        websiteId={websiteId}
        token={token}
        limit={limit}
        dataFilter={urlFilter}
        filterOptions={{ domain: websiteDomain, raw: filter === FILTER_RAW }}
        renderLabel={({ x }) => decodeURI(x)}
        onExpand={onExpand}
      />
    </>
  );
}

const FilterButtons = ({ buttons, selected, onClick }) => {
  return (
    <ButtonLayout>
      <ButtonGroup size="xsmall" items={buttons} selectedItem={selected} onClick={onClick} />
    </ButtonLayout>
  );
};
