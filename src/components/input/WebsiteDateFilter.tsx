import { Button, Icon, Row, Text, Select, ListItem } from '@umami/react-zen';
import { isAfter } from 'date-fns';
import { ChevronRight } from '@/components/icons';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
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
  const { dateRange } = useDateRange(websiteId);
  const { value, endDate } = dateRange;
  const { formatMessage, labels } = useMessages();
  const {
    router,
    updateParams,
    query: { compare = 'prev', offset = 0 },
  } = useNavigation();
  const isAllTime = value === 'all';
  const isCustomRange = value.startsWith('range');

  const disableForward = value === 'all' || isAfter(endDate, new Date());

  const handleChange = (date: string) => {
    router.push(updateParams({ date, offset: undefined }));
  };

  const handleIncrement = (increment: number) => {
    router.push(updateParams({ offset: +offset + increment }));
  };

  const handleSelect = (compare: any) => {
    router.push(updateParams({ compare }));
  };

  return (
    <Row gap>
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
      <Row width="200px">
        <DateFilter
          value={value}
          onChange={handleChange}
          showAllTime={showAllTime}
          renderDate={+offset !== 0}
        />
      </Row>
      {allowCompare && !isAllTime && (
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
