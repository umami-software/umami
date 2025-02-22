import { ReactNode } from 'react';
import { Loading, SearchField, Row, Column } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
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
  autoFocus = true,
  renderEmpty,
  children,
}: DataTableProps) {
  const { formatMessage, labels, messages } = useMessages();
  const { result, params, setParams, query } = queryResult || {};
  const { error, isLoading, isFetched } = query || {};
  const { page, pageSize, count, data } = result || {};
  const { search } = params || {};
  const hasData = Boolean(!isLoading && data?.length);
  const noResults = Boolean(search && !hasData);
  const { router, renderUrl } = useNavigation();

  const handleSearch = (search: string) => {
    setParams({ ...params, search });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
    router.push(renderUrl({ page }));
  };

  return (
    <>
      {allowSearch && (hasData || search) && (
        <Row width="280px" alignItems="center" marginBottom="6">
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={formatMessage(labels.search)}
          />
        </Row>
      )}
      <LoadingPanel data={data} isLoading={isLoading} isFetched={isFetched} error={error}>
        <Column>
          {hasData ? (typeof children === 'function' ? children(result) : children) : null}
          {isLoading && <Loading position="page" />}
          {!isLoading && !hasData && !search && (renderEmpty ? renderEmpty() : <Empty />)}
          {!isLoading && noResults && <Empty message={formatMessage(messages.noResultsFound)} />}
        </Column>
        {allowPaging && hasData && (
          <Row marginTop="6">
            <Pager page={page} pageSize={pageSize} count={count} onPageChange={handlePageChange} />
          </Row>
        )}
      </LoadingPanel>
    </>
  );
}
