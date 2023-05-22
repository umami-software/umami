import { useMemo } from 'react';
import { Loading, Icon, Text, Button } from 'react-basics';
import Link from 'next/link';
import firstBy from 'thenby';
import classNames from 'classnames';
import useApi from 'hooks/useApi';
import { percentFilter } from 'lib/filters';
import useDateRange from 'hooks/useDateRange';
import usePageQuery from 'hooks/usePageQuery';
import ErrorMessage from 'components/common/ErrorMessage';
import DataTable from './DataTable';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import Icons from 'components/icons';
import useMessages from 'hooks/useMessages';
import styles from './MetricsTable.module.css';
import useLocale from 'hooks/useLocale';

export function MetricsTable({
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
    resolveUrl,
    router,
    query: { url, referrer, os, browser, device, country, region, city },
  } = usePageQuery();
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();

  const { data, isLoading, isFetched, error } = useQuery(
    [
      'websites:metrics',
      { websiteId, type, modified, url, referrer, os, browser, device, country, region, city },
    ],
    () =>
      get(`/websites/${websiteId}/metrics`, {
        type,
        startAt: +startDate,
        endAt: +endDate,
        url,
        referrer,
        os,
        browser,
        device,
        country,
        region,
        city,
      }),
    { onSuccess: onDataLoad, retryDelay: delay || DEFAULT_ANIMATION_DURATION },
  );

  const filteredData = useMemo(() => {
    if (data) {
      let items = percentFilter(dataFilter ? dataFilter(data, filterOptions) : data);
      if (limit) {
        items = items.filter((e, i) => i < limit);
      }
      if (filterOptions?.sort === false) {
        return items;
      }
      return items.sort(firstBy('y', -1).thenBy('x'));
    }
    return [];
  }, [data, error, dataFilter, filterOptions]);
  const { dir } = useLocale();

  return (
    <div className={classNames(styles.container, className)}>
      {!data && isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {data && !error && <DataTable {...props} data={filteredData} className={className} />}
      <div className={styles.footer}>
        {data && !error && limit && (
          <Link href={router.pathname} as={resolveUrl({ view: type })}>
            <Button variant="quiet">
              <Text>{formatMessage(labels.more)}</Text>
              <Icon size="sm" rotate={dir === 'rtl' ? 180 : 0}>
                <Icons.ArrowRight />
              </Icon>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default MetricsTable;
