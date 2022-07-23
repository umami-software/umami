import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import firstBy from 'thenby';
import classNames from 'classnames';
import Link from 'components/common/Link';
import Loading from 'components/common/Loading';
import useFetch from 'hooks/useFetch';
import Arrow from 'assets/arrow-right.svg';
import { percentFilter } from 'lib/filters';
import useDateRange from 'hooks/useDateRange';
import usePageQuery from 'hooks/usePageQuery';
import ErrorMessage from 'components/common/ErrorMessage';
import DataTable from './DataTable';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import styles from './MetricsTable.module.css';

export default function MetricsTable({
  websiteId,
  type,
  className,
  dataFilter,
  filterOptions,
  limit,
  onDataLoad,
  delay = null,
  ...props
}) {
  const [{ startDate, endDate, modified }] = useDateRange(websiteId);
  const {
    resolve,
    router,
    query: { url, referrer, os, browser, device, country },
  } = usePageQuery();

  const { data, loading, error } = useFetch(
    `/website/${websiteId}/metrics`,
    {
      params: {
        type,
        start_at: +startDate,
        end_at: +endDate,
        url,
        referrer,
        os,
        browser,
        device,
        country,
      },
      onDataLoad,
      delay: delay || DEFAULT_ANIMATION_DURATION,
    },
    [type, modified, url, referrer, os, browser, device, country],
  );

  const filteredData = useMemo(() => {
    if (data) {
      const items = percentFilter(dataFilter ? dataFilter(data, filterOptions) : data);
      if (limit) {
        return items.filter((e, i) => i < limit).sort(firstBy('y', -1).thenBy('x'));
      }
      return items.sort(firstBy('y', -1).thenBy('x'));
    }
    return [];
  }, [data, error, dataFilter, filterOptions]);

  return (
    <div className={classNames(styles.container, className)}>
      {!data && loading && <Loading />}
      {error && <ErrorMessage />}
      {data && !error && <DataTable {...props} data={filteredData} className={className} />}
      <div className={styles.footer}>
        {data && !error && limit && (
          <Link
            icon={<Arrow />}
            href={router.pathname}
            as={resolve({ view: type })}
            size="small"
            iconRight
          >
            <FormattedMessage id="label.more" defaultMessage="More" />
          </Link>
        )}
      </div>
    </div>
  );
}
