import { ReactNode, useState } from 'react';
import { SearchField, Row, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Pager } from '@/components/common/Pager';
import { LoadingPanel } from '@/components/common/LoadingPanel';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataGridProps {
  queryResult: any;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  autoFocus?: boolean;
  renderActions?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataGrid({
  queryResult,
  searchDelay = 600,
  allowSearch,
  allowPaging = true,
  autoFocus,
  renderActions,
  children,
}: DataGridProps) {
  const { formatMessage, labels } = useMessages();
  const { data, error, isLoading, isFetching, setParams } = queryResult;
  const { router, updateParams } = useNavigation();
  const [search, setSearch] = useState('');

  const handleSearch = (search: string) => {
    setSearch(search);
    setParams(params => ({ ...params, search }));
    router.push(updateParams({ search }));
  };

  const handlePageChange = (page: number) => {
    setParams(params => ({ ...params, page }));
    router.push(updateParams({ page }));
  };

  return (
    <Column gap="4" minHeight="300px">
      {allowSearch && (data || search) && (
        <Row alignItems="center" justifyContent="space-between">
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={formatMessage(labels.search)}
            style={{ width: '280px' }}
          />
          {renderActions?.()}
        </Row>
      )}
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        {data && (
          <>
            <Column>{typeof children === 'function' ? children(data) : children}</Column>
            {allowPaging && data && (
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
