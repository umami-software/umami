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
  const showPager = allowPaging && data && data.count > 0;
  const { isMobile } = useMobile();
  const [userDisplayMode, setUserDisplayMode] = useState<DisplayMode | null>(() => {
    const stored = getItem(DISPLAY_MODE_STORAGE_KEY);
    return stored === 'table' || stored === 'cards' ? stored : null;
  });

  const displayMode: DisplayMode | undefined = isMobile ? 'cards' : (userDisplayMode ?? undefined);

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
    [router, updateParams, search],
  );

  const child = data ? (typeof children === 'function' ? children(data) : children) : null;

  const viewToggleButton = (
    <TooltipTrigger delay={0}>
      <Button variant="zero" onPress={handleToggleDisplayMode}>
        <Icon>{displayMode === 'cards' ? <Table2 /> : <LayoutGrid />}</Icon>
      </Button>
      <Tooltip>
        <Text>
          {displayMode === 'cards' ? t(labels.switchToTableView) : t(labels.switchToCardView)}
        </Text>
      </Tooltip>
    </TooltipTrigger>
  );

  return (
    <Column gap="4" minHeight="300px">
      <Row alignItems="center" wrap="wrap" gap>
        {allowSearch && (
          <SearchField
            value={search}
            onSearch={handleSearch}
            delay={searchDelay || DEFAULT_SEARCH_DELAY}
            autoFocus={autoFocus}
            placeholder={t(labels.search)}
          />
        )}
        <Row
          alignItems="center"
          gap
          style={isMobile ? { width: '100%', justifyContent: 'flex-start' } : { marginLeft: 'auto' }}
        >
          {renderActions?.()}
          {!isMobile && viewToggleButton}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              overflowX: 'auto',
            }}
          >
            <Column>
              {isValidElement(child)
                ? cloneElement(child as ReactElement<any>, { displayMode })
                : child}
            </Column>
          </div>
        )}
      </LoadingPanel>
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
