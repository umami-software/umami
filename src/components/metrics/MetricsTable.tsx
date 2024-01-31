import { ReactNode, useMemo, useState } from 'react';
import { Loading, Icon, Text, SearchField } from 'react-basics';
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
import useFormat from 'components//hooks/useFormat';
import styles from './MetricsTable.module.css';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  domainName: string;
  type?: string;
  className?: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  delay?: number;
  onDataLoad?: (data: any) => void;
  onSearch?: (search: string) => void;
  allowSearch?: boolean;
  children?: ReactNode;
}

export function MetricsTable({
  websiteId,
  type,
  className,
  dataFilter,
  limit,
  onDataLoad,
  delay = null,
  allowSearch = false,
  children,
  ...props
}: MetricsTableProps) {
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
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
        limit,
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

      if (search) {
        items = items.filter(({ x, ...data }) => {
          const value = formatValue(x, type, data);

          return value.toLowerCase().includes(search.toLowerCase());
        });
      }

      items = percentFilter(items);

      if (limit) {
        items = items.slice(0, limit - 1);
      }

      return items;
    }
    return [];
  }, [data, dataFilter, search, limit, formatValue, type]);

  return (
    <div className={classNames(styles.container, className)}>
      {error && <ErrorMessage />}
      <div className={styles.actions}>
        {allowSearch && (
          <SearchField
            className={styles.search}
            value={search}
            onSearch={setSearch}
            autoFocus={true}
          />
        )}
        {children}
      </div>
      {data && !error && (
        <ListTable {...(props as ListTableProps)} data={filteredData} className={className} />
      )}
      {!data && isLoading && !isFetched && <Loading icon="dots" />}
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
