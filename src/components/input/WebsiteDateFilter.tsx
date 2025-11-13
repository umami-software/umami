import { useCallback, useMemo } from 'react';
import { Button, Icon, Row, Text, Select, ListItem } from '@umami/react-zen';
import { isAfter } from 'date-fns';
import { ChevronRight } from '@/components/icons';
import { useDateRange, useDateRangeQuery, useMessages, useNavigation } from '@/components/hooks';
import { getDateRangeValue } from '@/lib/date';
import { DateFilter } from './DateFilter';

export interface WebsiteDateFilterProps {
  websiteId: string;
  compare?: string;
  showAllTime?: boolean;
  showButtons?: boolean;
  allowCompare?: boolean;
}

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
  showButtons = true,
  allowCompare,
}: WebsiteDateFilterProps) {
  const { dateRange, isAllTime, isCustomRange } = useDateRange();
  const { formatMessage, labels } = useMessages();
  const {
    router,
    updateParams,
    query: { compare = 'prev', offset = 0 },
  } = useNavigation();
  const disableForward = isAllTime || isAfter(dateRange.endDate, new Date());
  const showCompare = allowCompare && !isAllTime;

  const websiteDateRange = useDateRangeQuery(websiteId);

  const handleChange = (date: string) => {
    if (date === 'all') {
      router.push(
        updateParams({
          date: `${getDateRangeValue(websiteDateRange.startDate, websiteDateRange.endDate)}:all`,
          offset: undefined,
        }),
      );
    } else {
      router.push(updateParams({ date, offset: undefined }));
    }
  };

  const handleIncrement = useCallback(
    (increment: number) => {
      router.push(updateParams({ offset: +offset + increment }));
    },
    [offset],
  );

  const handleSelect = (compare: any) => {
    router.push(updateParams({ compare }));
  };

  const dateValue = useMemo(() => {
    return offset !== 0
      ? getDateRangeValue(dateRange.startDate, dateRange.endDate)
      : dateRange.value;
  }, [dateRange]);

  return (
    <Row wrap="wrap" gap>
      {showButtons && !isAllTime && !isCustomRange && (
        <Row gap="1">
          <Button onPress={() => handleIncrement(-1)} variant="outline">
            <Icon rotate={180}>
              <ChevronRight />
            </Icon>
          </Button>
          <Button onPress={() => handleIncrement(1)} variant="outline" isDisabled={disableForward}>
            <Icon>
              <ChevronRight />
            </Icon>
          </Button>
        </Row>
      )}
      <Row minWidth="200px">
        <DateFilter
          value={dateValue}
          onChange={handleChange}
          showAllTime={showAllTime}
          renderDate={+offset !== 0}
        />
      </Row>
      {showCompare && (
        <Row alignItems="center" gap>
          <Text weight="bold">VS</Text>
          <Row width="200px">
            <Select
              value={compare}
              onChange={handleSelect}
              popoverProps={{ style: { width: 200 } }}
            >
              <ListItem id="prev">{formatMessage(labels.previousPeriod)}</ListItem>
              <ListItem id="yoy">{formatMessage(labels.previousYear)}</ListItem>
            </Select>
          </Row>
        </Row>
      )}
    </Row>
  );
}
