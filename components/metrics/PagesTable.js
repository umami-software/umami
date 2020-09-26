import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Link from 'next/link';
import ButtonGroup from 'components/common/ButtonGroup';
import ButtonLayout from 'components/layout/ButtonLayout';
import { urlFilter } from 'lib/filters';
import { FILTER_COMBINED, FILTER_RAW } from 'lib/constants';
import usePageQuery from 'hooks/usePageQuery';
import MetricsTable from './MetricsTable';
import styles from './PagesTable.module.css';

export default function PagesTable({ websiteId, token, websiteDomain, limit, showFilters }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const {
    resolve,
    query: { url },
  } = usePageQuery();

  const buttons = [
    {
      label: <FormattedMessage id="metrics.filter.combined" defaultMessage="Combined" />,
      value: FILTER_COMBINED,
    },
    { label: <FormattedMessage id="metrics.filter.raw" defaultMessage="Raw" />, value: FILTER_RAW },
  ];

  const renderLink = ({ x }) => {
    return (
      <Link href={resolve({ url: x })} replace={true}>
        <a
          className={classNames({
            [styles.inactive]: url && x !== url,
            [styles.active]: x === url,
          })}
        >
          {decodeURI(x)}
        </a>
      </Link>
    );
  };

  return (
    <>
      {showFilters && <FilterButtons buttons={buttons} selected={filter} onClick={setFilter} />}
      <MetricsTable
        title={<FormattedMessage id="metrics.pages" defaultMessage="Pages" />}
        type="url"
        metric={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
        websiteId={websiteId}
        token={token}
        limit={limit}
        dataFilter={urlFilter}
        filterOptions={{ domain: websiteDomain, raw: filter === FILTER_RAW }}
        renderLabel={renderLink}
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
