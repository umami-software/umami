import { Button, Icon, ListItem, Row, Select, Text } from '@umami/react-zen';
import { useMemo } from 'react';
import { useMessages } from '@/components/hooks';
import { ChevronRight } from '@/components/icons';
import { PAGE_SIZE_OPTIONS } from '@/lib/constants';

export interface PagerProps {
  page: string | number;
  pageSize: string | number;
  count: string | number;
  isCapped?: boolean;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange?: (nextPageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pager({
  page,
  pageSize,
  count,
  isCapped,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PagerProps) {
  const { t, labels } = useMessages();
  const maxPage = pageSize && count ? Math.ceil(+count / +pageSize) : 0;
  const lastPage = page === maxPage;
  const firstPage = page === 1;
  const showNavigation = maxPage > 1 || isCapped;

  const options = useMemo(() => {
    const base = pageSizeOptions || PAGE_SIZE_OPTIONS;
    const current = +pageSize;
    if (current && !base.includes(current)) {
      return [...base, current].sort((a, b) => a - b);
    }
    return base;
  }, [pageSize, pageSizeOptions]);

  if (count === 0 || !maxPage) {
    return null;
  }

  const handlePageChange = (value: number) => {
    const nextPage = +page + +value;

    if (nextPage > 0 && nextPage <= maxPage) {
      onPageChange(nextPage);
    }
  };

  const displayCount = isCapped ? `10,000+` : (+count).toLocaleString();

  return (
    <Row alignItems="center" justifyContent="space-between" gap="3" flexGrow={1} wrap="wrap">
      <Text color="muted">{t(labels.numberOfRecords, { x: displayCount })}</Text>
      <Row alignItems="center" justifyContent="flex-end" gap="4" wrap="wrap">
        {onPageSizeChange && (
          <Row alignItems="center" gap="2" wrap="nowrap" style={{ whiteSpace: 'nowrap' }}>
            <Text color="muted">{t(labels.rowsPerPage)}</Text>
            <Select
              aria-label={t(labels.rowsPerPage)}
              value={Number(pageSize)}
              onChange={value => onPageSizeChange(Number(value))}
              triggerProps={{ 'aria-label': t(labels.rowsPerPage), style: { minWidth: 72 } }}
            >
              {options.map(size => (
                <ListItem key={size} id={size}>
                  {size}
                </ListItem>
              ))}
            </Select>
          </Row>
        )}
        {showNavigation && (
          <Row alignItems="center" gap="3" wrap="nowrap" style={{ whiteSpace: 'nowrap' }}>
            <Text color="muted">
              {t(labels.pageOf, {
                current: page.toLocaleString(),
                total: maxPage.toLocaleString(),
              })}
            </Text>
            <Row gap="1">
              <Button variant="outline" onPress={() => handlePageChange(-1)} isDisabled={firstPage}>
                <Icon size="sm" rotate={180}>
                  <ChevronRight />
                </Icon>
              </Button>
              <Button variant="outline" onPress={() => handlePageChange(1)} isDisabled={lastPage}>
                <Icon size="sm">
                  <ChevronRight />
                </Icon>
              </Button>
            </Row>
          </Row>
        )}
      </Row>
    </Row>
  );
}
