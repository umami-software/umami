import { Button, Icon, Row, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { ChevronRight } from '@/components/icons';

export interface PagerProps {
  page: string | number;
  pageSize: string | number;
  count: string | number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function Pager({ page, pageSize, count, onPageChange }: PagerProps) {
  const { formatMessage, labels } = useMessages();
  const maxPage = pageSize && count ? Math.ceil(+count / +pageSize) : 0;
  const lastPage = page === maxPage;
  const firstPage = page === 1;

  if (count === 0 || !maxPage) {
    return null;
  }

  const handlePageChange = (value: number) => {
    const nextPage = +page + +value;

    if (nextPage > 0 && nextPage <= maxPage) {
      onPageChange(nextPage);
    }
  };

  if (maxPage === 1) {
    return null;
  }

  return (
    <Row alignItems="center" justifyContent="space-between" gap="3" flexGrow={1}>
      <Text>{formatMessage(labels.numberOfRecords, { x: count.toLocaleString() })}</Text>
      <Row alignItems="center" justifyContent="flex-end" gap="3">
        <Text>
          {formatMessage(labels.pageOf, {
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
    </Row>
  );
}
