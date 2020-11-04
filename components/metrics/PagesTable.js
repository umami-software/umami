import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Link from 'next/link';
import FilterButtons from 'components/common/FilterButtons';
import { urlFilter } from 'lib/filters';
import usePageQuery from 'hooks/usePageQuery';
import MetricsTable from './MetricsTable';
import styles from './PagesTable.module.css';

export const FILTER_COMBINED = 0;
export const FILTER_RAW = 1;

export default function PagesTable({ websiteId, websiteDomain, showFilters, ...props }) {
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
        dataFilter={urlFilter}
        filterOptions={{ domain: websiteDomain, raw: filter === FILTER_RAW }}
        renderLabel={renderLink}
        {...props}
      />
    </>
  );
}
