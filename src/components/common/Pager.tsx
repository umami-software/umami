import { Button, Icon, Row, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { ChevronRight } from '@/components/icons';

export interface PagerProps {
  page: string | number;
  pageSize: string | number;
  count: string | number;
  isCapped?: boolean;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function Pager({ page, pageSize, count, isCapped, onPageChange }: PagerProps) {
  const { t, labels } = useMessages();
  const maxPage = pageSize && count ? Math.ceil(+count / +pageSize) : 0;
  const lastPage = page === maxPage;
  const firstPage = page === 1;
  const showNavigation = maxPage > 1 || isCapped;

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
      <Row
        alignItems="center"
        justifyContent="flex-end"
        gap="3"
        wrap="nowrap"
        style={{ whiteSpace: 'nowrap' }}
      >
        {showNavigation && (
          <>
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
          </>
        )}
      </Row>
    </Row>
  );
}
