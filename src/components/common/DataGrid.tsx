import { ReactNode } from 'react';
import { SearchField, Row, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Pager } from '@/components/common/Pager';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { PagedQueryResult } from '@/lib/types';

const DEFAULT_SEARCH_DELAY = 600;

export interface DataTableProps {
  queryResult: PagedQueryResult<any>;
  searchDelay?: number;
  allowSearch?: boolean;
  allowPaging?: boolean;
  autoFocus?: boolean;
  renderEmpty?: () => ReactNode;
  children: ReactNode | ((data: any) => ReactNode);
}

export function DataGrid({
  queryResult,
  searchDelay = 600,
  allowSearch = true,
  allowPaging = true,
  autoFocus,
  children,
}: DataTableProps) {
  const { formatMessage, labels } = useMessages();
  const { result, params, setParams, query } = queryResult || {};
  const { error, isLoading, isFetching } = query || {};
  const { page, pageSize, count, data } = result || {};
  const { search } = params || {};
  const hasData = Boolean(!isLoading && data?.length);
  const { router, updateParams } = useNavigation();

  const handleSearch = (search: string) => {
    setParams({ ...params, search });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
    router.push(updateParams({ page }));
  };

  return (
    <Column gap="4" minHeight="300px">
      {allowSearch && (hasData || search) && (
        <Row width="280px" alignItems="center">
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={formatMessage(labels.search)}
          />
        </Row>
      )}
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        <Column>
          {hasData ? (typeof children === 'function' ? children(result) : children) : null}
        </Column>
        {allowPaging && hasData && (
          <Row marginTop="6">
            <Pager page={page} pageSize={pageSize} count={count} onPageChange={handlePageChange} />
          </Row>
        )}
      </LoadingPanel>
    </Column>
  );
}
