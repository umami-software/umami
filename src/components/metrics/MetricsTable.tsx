import { ReactNode, useMemo, useState } from 'react';
import { Button, Column, Icon, Row, SearchField, Text } from '@umami/react-zen';
import { LinkButton } from '@/components/common/LinkButton';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useFormat,
  useMessages,
  useNavigation,
  useWebsiteExpandedMetricsQuery,
  useWebsiteMetricsQuery,
} from '@/components/hooks';
import { Close, Maximize } from '@/components/icons';
import { DownloadButton } from '@/components/input/DownloadButton';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';
import { percentFilter } from '@/lib/filters';

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
  isExpanded?: boolean;
  onClose?: () => void;
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
  isExpanded = false,
  onClose,
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
      enabled: isExpanded,
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
      enabled: !isExpanded,
    },
  );

  const { data, isLoading, isFetching, error } = isExpanded ? expandedQuery : query;

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

  const downloadData = isExpanded ? data : filteredData;
  const hasActions = data && (allowSearch || allowDownload || onClose || children);

  return (
    <LoadingPanel
      data={data}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      height="100%"
    >
      {hasActions && (
        <Row alignItems="center" paddingBottom="3">
          {allowSearch && <SearchField value={search} onSearch={setSearch} delay={300} />}
          <Row justifyContent="flex-end" flexGrow={1} gap>
            {children}
            {allowDownload && <DownloadButton filename={type} data={downloadData} />}
            {onClose && (
              <Button onPress={onClose} variant="quiet">
                <Icon>
                  <Close />
                </Icon>
              </Button>
            )}
          </Row>
        </Row>
      )}
      <Column
        overflowY="auto"
        minHeight="0"
        height="100%"
        paddingRight="3"
        overflow="hidden"
        flexGrow={1}
      >
        {data &&
          (isExpanded ? (
            <ListExpandedTable {...(props as ListExpandedTableProps)} data={data} />
          ) : (
            <ListTable {...(props as ListTableProps)} data={filteredData} />
          ))}
      </Column>
      {showMore && limit && (
        <Row justifyContent="center">
          <LinkButton href={updateParams({ view: type })} variant="quiet">
            <Icon size="sm">
              <Maximize />
            </Icon>
            <Text>{formatMessage(labels.more)}</Text>
          </LinkButton>
        </Row>
      )}
    </LoadingPanel>
  );
}
