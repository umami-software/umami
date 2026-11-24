import {
  Button,
  Icon,
  Row,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@umami/react-zen';
import { isAfter } from 'date-fns';
import { useMemo } from 'react';
import { useDateRange, useDateRangeQuery, useMessages, useNavigation } from '@/components/hooks';
import { ChevronRight } from '@/components/icons';
import { getDateRangeValue } from '@/lib/date';
import { DateFilter } from './DateFilter';

export interface WebsiteDateFilterProps {
  websiteId?: string;
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
  const { t, labels } = useMessages();
  const {
    router,
    updateParams,
    query: { compare = 'prev', offset = 0 },
  } = useNavigation();
  const disableForward = isAllTime || isAfter(dateRange.endDate, new Date());
  const showCompare = allowCompare && !isAllTime;

  const websiteDateRange = useDateRangeQuery(websiteId);
  const { startDate, endDate } = websiteDateRange;
  const hasData = startDate && endDate;

  const handleChange = (date: string) => {
    if (date === 'all' && hasData) {
      router.push(
        updateParams({
          date: `${getDateRangeValue(websiteDateRange.startDate, websiteDateRange.endDate)}:all`,
          offset: undefined,
          page: 1,
        }),
      );
    } else {
      router.push(updateParams({ date, offset: undefined, unit: undefined, page: 1 }));
    }
  };

  const handleIncrement = increment => {
    router.push(updateParams({ offset: Number(offset) + increment }));
  };
  const handleSelect = (compare: any) => {
    router.push(updateParams({ compare }));
  };

  const compareItems = [
    { value: 'prev', label: t(labels.previousPeriod) },
    { value: 'yoy', label: t(labels.previousYear) },
  ];

  const dateValue = useMemo(() => {
    return offset !== 0
      ? getDateRangeValue(dateRange.startDate, dateRange.endDate)
      : dateRange.value;
  }, [dateRange]);

  return (
    <Row wrap="wrap" gap>
      {showButtons && !isAllTime && !isCustomRange && (
        <Row gap="1">
          <Button onClick={() => handleIncrement(-1)} variant="outline">
            <Icon rotate={180}>
              <ChevronRight />
            </Icon>
          </Button>
          <Button onClick={() => handleIncrement(1)} variant="outline" disabled={disableForward}>
            <Icon>
              <ChevronRight />
            </Icon>
          </Button>
        </Row>
      )}
      <DateFilter
        buttonProps={{ style: { minWidth: 200 } }}
        value={dateValue}
        onChange={handleChange}
        showAllTime={hasData && showAllTime}
        renderDate={+offset !== 0}
      />
      {showCompare && (
        <Row alignItems="center" gap>
          <Text weight="bold">VS</Text>
          <Row width="200px">
            <Select
              items={compareItems}
              value={compare}
              onValueChange={value => handleSelect(value)}
            >
              <SelectTrigger style={{ width: 200 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} style={{ width: 200 }}>
                {compareItems.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
        </Row>
      )}
    </Row>
  );
}
