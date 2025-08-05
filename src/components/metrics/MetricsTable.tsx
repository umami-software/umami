import { LinkButton } from '@/components/common/LinkButton';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useFormat,
  useMessages,
  useNavigation,
  useWebsiteExpandedMetricsQuery,
  useWebsiteMetricsQuery,
} from '@/components/hooks';
import { Arrow } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';
import { Column, Icon, Row, SearchField, Text } from '@umami/react-zen';
import { ReactNode, useMemo, useState } from 'react';
import { ListExpandedTable, ListExpandedTableProps } from './ListExpandedTable';
import { ListTable, ListTableProps } from './ListTable';

export interface MetricsTableProps extends ListTableProps {
  websiteId: string;
  type?: string;
  dataFilter?: (data: any) => any;
  limit?: number;
  delay?: number;
  onSearch?: (search: string) => void;
  allowSearch?: boolean;
  searchFormattedValues?: boolean;
  showMore?: boolean;
  params?: { [key: string]: any };
  allowDownload?: boolean;
  expanded?: boolean;
  children?: ReactNode;
}

export function MetricsTable({
  websiteId,
  type,
  dataFilter,
  limit,
  delay = null,
  allowSearch = false,
  searchFormattedValues = false,
  showMore = true,
  params,
  allowDownload = true,
  expanded = false,
  children,
  ...props
}: MetricsTableProps) {
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();
  const { formatMessage, labels } = useMessages();

  const expandedQuery = useWebsiteExpandedMetricsQuery(
    websiteId,
    {
      type,
      search: searchFormattedValues ? undefined : search,
      ...params,
    },
    {
      retryDelay: delay || DEFAULT_ANIMATION_DURATION,
      enabled: expanded,
    },
  );

  const query = useWebsiteMetricsQuery(
    websiteId,
    {
      type,
      limit,
      search: searchFormattedValues ? undefined : search,
      ...params,
    },
    {
      retryDelay: delay || DEFAULT_ANIMATION_DURATION,
      enabled: !expanded,
    },
  );

  const { data, isLoading, isFetching, error } = expanded ? expandedQuery : query;

  const filteredData = useMemo(() => {
    if (data) {
      let items = data as any[];

      if (dataFilter) {
        if (Array.isArray(dataFilter)) {
          items = dataFilter.reduce((arr, filter) => {
            return filter(arr);
          }, items);
        } else {
          items = dataFilter(items);
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

  const downloadData = expanded ? data : filteredData;

  return (
    <Column gap="3" justifyContent="space-between">
      <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error} gap>
        <Row alignItems="center" justifyContent="space-between">
          {allowSearch && <SearchField value={search} onSearch={setSearch} delay={300} />}
          <Row>
            {children}
            {allowDownload && <DownloadButton filename={type} data={downloadData} />}
          </Row>
        </Row>
        {data &&
          (expanded ? (
            <ListExpandedTable {...(props as ListExpandedTableProps)} data={data} type={type} />
          ) : (
            <ListTable {...(props as ListTableProps)} data={filteredData} />
          ))}
        <Row justifyContent="center">
          {showMore && data && !error && limit && (
            <LinkButton href={updateParams({ view: type })} variant="quiet">
              <Text>{formatMessage(labels.more)}</Text>
              <Icon size="sm">
                <Arrow />
              </Icon>
            </LinkButton>
          )}
        </Row>
      </LoadingPanel>
    </Column>
  );
}
