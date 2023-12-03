import { useMemo } from 'react';
import { Loading, Icon, Text } from 'react-basics';
import classNames from 'classnames';
import useApi from 'components/hooks/useApi';
import { percentFilter } from 'lib/filters';
import useDateRange from 'components/hooks/useDateRange';
import useNavigation from 'components/hooks/useNavigation';
import ErrorMessage from 'components/common/ErrorMessage';
import LinkButton from 'components/common/LinkButton';
import ListTable, { ListTableProps } from './ListTable';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import Icons from 'components/icons';
import useMessages from 'components/hooks/useMessages';
import useLocale from 'components/hooks/useLocale';
import styles from './MetricsTable.module.css';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  type?: string;
  className?: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  delay?: number;
  onDataLoad?: (data: any) => void;
}

export function MetricsTable({
  websiteId,
  type,
  className,
  dataFilter,
  limit,
  onDataLoad,
  delay = null,
  ...props
}: MetricsTableProps) {
  const [{ startDate, endDate, modified }] = useDateRange(websiteId);
  const {
    makeUrl,
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const { dir } = useLocale();

  const { data, isLoading, isFetched, error } = useQuery({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        type,
        modified,
        url,
        referrer,
        os,
        title,
        browser,
        device,
        country,
        region,
        city,
      },
    ],
    queryFn: async () => {
      const filters = { url, title, referrer, os, browser, device, country, region, city };

      filters[type] = undefined;

      const data = await get(`/websites/${websiteId}/metrics`, {
        type,
        startAt: +startDate,
        endAt: +endDate,
        ...filters,
      });

      onDataLoad?.(data);

      return data;
    },
    retryDelay: delay || DEFAULT_ANIMATION_DURATION,
  });

  const filteredData = useMemo(() => {
    if (data) {
      let items: any[] = data;

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, items);
        } else {
          items = dataFilter(data);
        }
      }

      items = percentFilter(items);

      if (limit) {
        items = items.filter((e, i) => i < limit);
      }

      return items;
    }
    return [];
  }, [data, error, dataFilter, limit]);

  return (
    <div className={classNames(styles.container, className)}>
      {!data && isLoading && !isFetched && <Loading icon="dots" />}
      {error && <ErrorMessage />}
      {data && !error && (
        <ListTable {...(props as ListTableProps)} data={filteredData} className={className} />
      )}
      <div className={styles.footer}>
        {data && !error && limit && (
          <LinkButton href={makeUrl({ view: type })} variant="quiet">
            <Text>{formatMessage(labels.more)}</Text>
            <Icon size="sm" rotate={dir === 'rtl' ? 180 : 0}>
              <Icons.ArrowRight />
            </Icon>
          </LinkButton>
        )}
      </div>
    </div>
  );
}

export default MetricsTable;
