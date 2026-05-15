import type { UseQueryResult } from '@tanstack/react-query';
import { Column, Row, SearchField } from '@umami/react-zen';
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import { Empty } from '@/components/common/Empty';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Pager } from '@/components/common/Pager';
import { useMessages, useMobile, useNavigation } from '@/components/hooks';
import type { PageResult } from '@/lib/types';

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
  const { t, labels } = useMessages();
  const { data, error, isLoading, isFetching } = query;
  const { router, updateParams, query: queryParams } = useNavigation();
  const [search, setSearch] = useState(queryParams?.search || data?.search || '');
  const showPager = allowPaging && data && data.count > 0;
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
    [search, updateParams],
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
            placeholder={t(labels.search)}
          />
          {renderActions?.()}
        </Row>
      )}
      <LoadingPanel
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        renderEmpty={renderEmpty}
      >
        {data && (
          <>
            {/*
              Wrap the table in a horizontally scrollable container. The
              react-zen DataTable lays its columns out on a CSS Grid with
              fixed pixel widths, so the sum of column widths becomes the
              table's max-content and propagates up through the surrounding
              flex chain into the Tabs grid track, pinning every ancestor
              wider than the viewport on small screens. overflow-x: auto on
              its own does not break that chain because the wrapper still
              stretches to its parent's width. Setting display: grid with
              grid-template-columns: minmax(0, 1fr) gives the wrapper an
              explicit 1fr column that resolves to the available space,
              caps its own intrinsic width, and lets overflow-x: auto
              kick in so the user can scroll the columns horizontally
              instead of having the card overflow off screen.
            */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                overflowX: 'auto',
              }}
            >
              {isValidElement(child)
                ? cloneElement(child as ReactElement<any>, { displayMode })
                : child}
            </div>
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
    <Column gap="4" minHeight="300px" justifyContent="space-between">
      <Column gap="4">
        {allowSearch && (
          <Row alignItems="center" justifyContent="space-between" wrap="wrap" gap>
            <SearchField
              value={search}
              onSearch={handleSearch}
              delay={searchDelay || DEFAULT_SEARCH_DELAY}
              autoFocus={autoFocus}
              placeholder={t(labels.search)}
            />
            {renderActions?.()}
          </Row>
        )}
        <LoadingPanel
          data={data?.data}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          renderEmpty={renderEmpty}
        >
          {data && (
            <Column>
              {isValidElement(child)
                ? cloneElement(child as ReactElement<any>, { displayMode })
                : child}
            </Column>
          )}
        </LoadingPanel>
      </Column>
      {showPager && (
        <Row marginTop="4">
          <Pager
            page={data.page}
            pageSize={data.pageSize}
            count={data.count}
            isCapped={data.isCapped}
            onPageChange={handlePageChange}
          />
        </Row>
      )}
    </Column>
  );
}
