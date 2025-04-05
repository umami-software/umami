import { useDateRange } from '@/components/hooks';
import { isAfter } from 'date-fns';
import { getOffsetDateRange } from '@/lib/date';
import { Button, Icon, Icons, Row } from '@umami/react-zen';
import { DateFilter } from './DateFilter';
import { DateRange } from '@/lib/types';

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
}: {
  websiteId: string;
  showAllTime?: boolean;
}) {
  const { dateRange, saveDateRange } = useDateRange(websiteId);
  const { value, startDate, endDate, offset } = dateRange;
  const disableForward =
    value === 'all' || isAfter(getOffsetDateRange(dateRange, 1).startDate, new Date());

  const handleChange = (value: string | DateRange) => {
    console.log('WebsiteDateFilter', value);
    saveDateRange(value);
  };

  const handleIncrement = (increment: number) => {
    saveDateRange(getOffsetDateRange(dateRange, increment));
  };

  console.log({ dateRange, disableForward });

  return (
    <Row gap="3">
      {value !== 'all' && !value.startsWith('range') && (
        <Row gap="1">
          <Button onPress={() => handleIncrement(-1)} variant="quiet">
            <Icon size="xs" rotate={180}>
              <Icons.Chevron />
            </Icon>
          </Button>
          <Button onPress={() => handleIncrement(1)} variant="quiet" isDisabled={disableForward}>
            <Icon size="xs">
              <Icons.Chevron />
            </Icon>
          </Button>
        </Row>
      )}
      <DateFilter
        value={value}
        startDate={startDate}
        endDate={endDate}
        offset={offset}
        onChange={handleChange}
        showAllTime={showAllTime}
      />
    </Row>
  );
}
