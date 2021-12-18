import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import MetricsTable from './MetricsTable';
import FilterButtons from 'components/common/FilterButtons';
import { refFilter } from 'lib/filters';
import { safeDecodeURI } from 'lib/url';
import Link from 'next/link';
import classNames from 'classnames';
import usePageQuery from 'hooks/usePageQuery';
import External from 'assets/arrow-up-right-from-square.svg';
import Icon from '../common/Icon';
import styles from './ReferrersTable.module.css';

export const FILTER_DOMAIN_ONLY = 0;
export const FILTER_COMBINED = 1;
export const FILTER_RAW = 2;

export default function ReferrersTable({ websiteId, websiteDomain, showFilters, ...props }) {
  const [filter, setFilter] = useState(FILTER_COMBINED);
  const {
    resolve,
    query: { ref: currentRef },
  } = usePageQuery();

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

  const renderLink = ({ w: link, x: label }) => {
    return (
      <div className={styles.row}>
        <Link href={resolve({ ref: label })} replace={true}>
          <a
            className={classNames(styles.label, {
              [styles.inactive]: currentRef && label !== currentRef,
              [styles.active]: label === currentRef,
            })}
          >
            {safeDecodeURI(label)}
          </a>
        </Link>
        <a href={link || label} target="_blank" rel="noreferrer noopener" className={styles.link}>
          <Icon icon={<External />} className={styles.icon} />
        </a>
      </div>
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
