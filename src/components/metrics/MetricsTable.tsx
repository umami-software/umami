import { ReactNode, useMemo, useState } from 'react';
import { Loading, Icon, Text, SearchField } from 'react-basics';
import classNames from 'classnames';
import ErrorMessage from 'components/common/ErrorMessage';
import LinkButton from 'components/common/LinkButton';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { percentFilter } from 'lib/filters';
import {
  useNavigation,
  useWebsiteMetrics,
  useMessages,
  useLocale,
  useFormat,
} from 'components/hooks';
import Icons from 'components/icons';
import ListTable, { ListTableProps } from './ListTable';
import styles from './MetricsTable.module.css';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  type?: string;
  className?: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  delay?: number;
  onDataLoad?: (data: any) => void;
  onSearch?: (search: string) => void;
  allowSearch?: boolean;
  searchFormattedValues?: boolean;
  showMore?: boolean;
  params?: { [key: string]: any };
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
  searchFormattedValues = false,
  showMore = true,
  params,
  children,
  ...props
}: MetricsTableProps) {
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
  const { renderUrl } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { dir } = useLocale();

  const { data, isLoading, isFetched, error } = useWebsiteMetrics(
    websiteId,
    { type, limit, search: searchFormattedValues ? undefined : search, ...params },
    {
      retryDelay: delay || DEFAULT_ANIMATION_DURATION,
      onDataLoad,
    },
  );

  const filteredData = useMemo(() => {
    if (data) {
      let items = data as any[];

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, items);
        } else {
          items = dataFilter(data);
        }
      }

      if (searchFormattedValues && search) {
        items = items.filter(({ x, ...data }) => {
          const value = formatValue(x, type, data);

          return value?.toLowerCase().includes(search.toLowerCase());
        });
      }

      items = percentFilter(items);

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
            delay={300}
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
        {showMore && data && !error && limit && (
          <LinkButton href={renderUrl({ view: type })} variant="quiet">
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
