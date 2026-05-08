import type { UseQueryResult } from '@tanstack/react-query';
import {
  Button,
  Column,
  Icon,
  Row,
  SearchField,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { LayoutGrid, Table2 } from 'lucide-react';
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
import { getItem, setItem } from '@/lib/storage';
import type { PageResult } from '@/lib/types';

const DEFAULT_SEARCH_DELAY = 600;
const DISPLAY_MODE_STORAGE_KEY = 'umami.datagrid.displayMode';

type DisplayMode = 'table' | 'cards';

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
  const showPager = allowPaging && data && data.count > data.pageSize;
  const { isMobile } = useMobile();
  const [userDisplayMode, setUserDisplayMode] = useState<DisplayMode | null>(
    () => getItem(DISPLAY_MODE_STORAGE_KEY) ?? null,
  );

  // Effective mode: explicit user choice wins, otherwise fall back to the
  // mobile-driven default (cards on small viewports, table elsewhere).
  const displayMode: DisplayMode | undefined = userDisplayMode ?? (isMobile ? 'cards' : undefined);

  const handleToggleDisplayMode = () => {
    const next: DisplayMode = displayMode === 'cards' ? 'table' : 'cards';
    setItem(DISPLAY_MODE_STORAGE_KEY, next);
    setUserDisplayMode(next);
  };

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

  const viewToggleButton = (
    <TooltipTrigger delay={0}>
      <Button variant="zero" onPress={handleToggleDisplayMode}>
        <Icon>{displayMode === 'cards' ? <Table2 /> : <LayoutGrid />}</Icon>
      </Button>
      <Tooltip>
        <Text>{displayMode === 'cards' ? 'Switch to table view' : 'Switch to card view'}</Text>
      </Tooltip>
    </TooltipTrigger>
  );

  return (
    <Column gap="4" minHeight="300px">
      <Row alignItems="center" justifyContent="space-between" wrap="wrap" gap>
        {allowSearch ? (
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={t(labels.search)}
          />
        ) : (
          <span />
        )}
        <Row alignItems="center" gap>
          {renderActions?.()}
          {viewToggleButton}
        </Row>
      </Row>
      <LoadingPanel
        data={data?.data}
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
