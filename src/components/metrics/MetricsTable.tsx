import { ReactNode, useMemo, useState } from 'react';
import { Icon, Text, SearchField, Row, Column } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';
import { useNavigation, useWebsiteMetricsQuery, useMessages, useFormat } from '@/components/hooks';
import { Arrow } from '@/components/icons';
import { ListTable, ListTableProps } from './ListTable';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { DownloadButton } from '@/components/input/DownloadButton';

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
  children,
  ...props
}: MetricsTableProps) {
  const [search, setSearch] = useState('');
  const { formatValue } = useFormat();
  const { updateParams } = useNavigation();
  const { formatMessage, labels } = useMessages();

  const { data, isLoading, isFetching, error } = useWebsiteMetricsQuery(
    websiteId,
    {
      type,
      limit,
      search: searchFormattedValues ? undefined : search,
      ...params,
    },
    {
      retryDelay: delay || DEFAULT_ANIMATION_DURATION,
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

  return (
    <Column gap="3" justifyContent="space-between">
      <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error} gap>
        <Row alignItems="center" justifyContent="space-between">
          {allowSearch && <SearchField value={search} onSearch={setSearch} delay={300} />}
          <Row>
            {children}
            {allowDownload && <DownloadButton filename={type} data={filteredData} />}
          </Row>
        </Row>
        {data && <ListTable {...(props as ListTableProps)} data={filteredData} />}
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
