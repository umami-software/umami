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
import { Icons } from '@/components/icons';
import { useDateRange, useMessages, useNavigation } from '@/components/hooks';
import { getOffsetDateRange } from '@/lib/date';
import { DateRange } from '@/lib/types';
import { DateFilter } from './DateFilter';

export function WebsiteDateFilter({
  websiteId,
  showAllTime = true,
  showButtons = true,
  showCompare = true,
}: {
  websiteId: string;
  compare?: string;
  showAllTime?: boolean;
  showButtons?: boolean;
  showCompare?: boolean;
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

  const handleChange = (value: string | DateRange) => {
    saveDateRange(value);
  };

  const handleIncrement = (increment: number) => {
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
      {!isAllTime && compare && (
        <Row alignItems="center" gap>
          <Text>VS</Text>
          <Select selectedKey={compare} onSelectionChange={handleSelect} style={{ width: '200px' }}>
            <ListItem id="prev">{formatMessage(labels.previousPeriod)}</ListItem>
            <ListItem id="yoy">{formatMessage(labels.previousYear)}</ListItem>
          </Select>
        </Row>
      )}
      {!isAllTime && showCompare && (
        <TooltipTrigger delay={0}>
          <Button variant="quiet" onPress={handleCompare}>
            <Icon fillColor="currentColor">{compare ? <Icons.Close /> : <Icons.Compare />}</Icon>
          </Button>
          <Tooltip>{formatMessage(compare ? labels.cancel : labels.compareDates)}</Tooltip>
        </TooltipTrigger>
      )}
    </Row>
  );
}
