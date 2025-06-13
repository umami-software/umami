import {
  Button,
  Icon,
  Row,
  Text,
  Select,
  ListItem,
  TooltipTrigger,
  Tooltip,
} from '@umami/react-zen';
import { isAfter } from 'date-fns';
import { Chevron, Close, Compare } from '@/components/icons';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { getOffsetDateRange } from '@/lib/date';
import { DateRange } from '@/lib/types';
import { DateFilter } from './DateFilter';

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
  showButtons = true,
  allowCompare,
}: {
  websiteId: string;
  compare?: string;
  showAllTime?: boolean;
  showButtons?: boolean;
  allowCompare?: boolean;
}) {
  const { dateRange, saveDateRange } = useDateRange(websiteId);
  const { value, startDate, endDate, offset } = dateRange;
  const { formatMessage, labels } = useMessages();
  const {
    router,
    renderUrl,
    query: { compare },
  } = useNavigation();
  const isAllTime = value === 'all';
  const isCustomRange = value.startsWith('range');

  const disableForward =
    value === 'all' || isAfter(getOffsetDateRange(dateRange, 1).startDate, new Date());

  const handleChange = (date: string | DateRange) => {
    router.push(renderUrl({ date }));
    saveDateRange(date);
  };

  const handleIncrement = (increment: number) => {
    router.push(renderUrl({ offset: offset + increment }));
    saveDateRange(getOffsetDateRange(dateRange, increment));
  };

  const handleSelect = (compare: any) => {
    router.push(renderUrl({ compare }));
  };

  const handleCompare = () => {
    router.push(renderUrl({ compare: compare ? undefined : 'prev' }));
  };

  return (
    <Row gap="3">
      {showButtons && !isAllTime && !isCustomRange && (
        <Row gap="1">
          <Button onPress={() => handleIncrement(-1)} variant="outline">
            <Icon rotate={180}>
              <Chevron />
            </Icon>
          </Button>
          <Button onPress={() => handleIncrement(1)} variant="outline" isDisabled={disableForward}>
            <Icon>
              <Chevron />
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
      {!isAllTime && compare && (
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
      {!isAllTime && allowCompare && (
        <TooltipTrigger delay={0}>
          <Button variant="quiet" onPress={handleCompare}>
            <Icon fillColor>{compare ? <Close /> : <Compare />}</Icon>
          </Button>
          <Tooltip>{formatMessage(compare ? labels.cancel : labels.compareDates)}</Tooltip>
        </TooltipTrigger>
      )}
    </Row>
  );
}
