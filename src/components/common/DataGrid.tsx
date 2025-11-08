import {
  ReactNode,
  useState,
  useCallback,
  ReactElement,
  cloneElement,
  isValidElement,
} from 'react';
import { SearchField, Row, Column } from '@umami/react-zen';
import { UseQueryResult } from '@tanstack/react-query';
import { useMessages, useMobile, useNavigation } from '@/components/hooks';
import { Pager } from '@/components/common/Pager';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PageResult } from '@/lib/types';
import { Empty } from '@/components/common/Empty';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataGridProps {
  query: UseQueryResult<PageResult<any>, any>;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  autoFocus?: boolean;
  renderActions?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataGrid({
  query,
  searchDelay = 600,
  allowSearch,
  allowPaging = true,
  autoFocus,
  renderActions,
  renderEmpty = () => <Empty />,
  children,
}: DataGridProps) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading, isFetching } = query;
  const { router, updateParams, query: queryParams } = useNavigation();
  const [search, setSearch] = useState(queryParams?.search || data?.search || '');
  const showPager = allowPaging && data && data.count > data.pageSize;
  const { isMobile } = useMobile();
  const displayMode = isMobile ? 'cards' : undefined;

  const handleSearch = (value: string) => {
    if (value !== search) {
      setSearch(value);
      router.push(updateParams({ search: value, page: 1 }));
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      router.push(updateParams({ search, page }));
    },
    [search],
  );

  const child = data ? (typeof children === 'function' ? children(data) : children) : null;

  return (
    <Column gap="4" minHeight="300px">
      {allowSearch && (
        <Row alignItems="center" justifyContent="space-between" wrap="wrap" gap>
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={formatMessage(labels.search)}
          />
          {renderActions?.()}
        </Row>
      )}
      <LoadingPanel
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        renderEmpty={renderEmpty}
      >
        {data && (
          <>
            <Column>
              {isValidElement(child)
                ? cloneElement(child as ReactElement<any>, { displayMode })
                : child}
            </Column>
            {showPager && (
              <Row marginTop="6">
                <Pager
                  page={data.page}
                  pageSize={data.pageSize}
                  count={data.count}
                  onPageChange={handlePageChange}
                />
              </Row>
            )}
          </>
        )}
      </LoadingPanel>
    </Column>
  );
}
