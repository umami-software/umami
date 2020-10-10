import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
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
  websiteDomain,
  token,
  title,
  metric,
  type,
  className,
  dataFilter,
  filterOptions,
  limit,
  renderLabel,
  height,
  onDataLoad = () => {},
}) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const {
    resolve,
    router,
    query: { url },
  } = usePageQuery();

  const { data, loading, error } = useFetch(
    `/api/website/${websiteId}/metrics`,
    {
      params: {
        type,
        start_at: +startDate,
        end_at: +endDate,
        domain: websiteDomain,
        url,
        token,
      },
      onDataLoad,
      delay: DEFAULT_ANIMATION_DURATION,
    },
    [modified],
  );

  const filteredData = useMemo(() => {
    if (data) {
      const items = percentFilter(dataFilter ? dataFilter(data, filterOptions) : data);
      if (limit) {
        return items.filter((e, i) => i < limit);
      }
      return items;
    }
    return [];
  }, [data, error, dataFilter, filterOptions]);

  return (
    <div className={classNames(styles.container, className)}>
      {!data && loading && <Loading />}
      {error && <ErrorMessage />}
      {data && !error && (
        <DataTable
          title={title}
          data={filteredData}
          metric={metric}
          className={className}
          renderLabel={renderLabel}
          limit={limit}
          height={height}
          animate={limit > 0}
        />
      )}
      <div className={styles.footer}>
        {limit && (
          <Link
            icon={<Arrow />}
            href={router.pathname}
            as={resolve({ view: type })}
            size="small"
            iconRight
          >
            <FormattedMessage id="button.more" defaultMessage="More" />
          </Link>
        )}
      </div>
    </div>
  );
}
