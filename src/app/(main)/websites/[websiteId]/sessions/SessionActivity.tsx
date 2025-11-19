import { isSameDay } from 'date-fns';
import {
  Icon,
  StatusLight,
  Column,
  Row,
  Heading,
  Text,
  Button,
  DialogTrigger,
  Popover,
  Dialog,
} from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Eye, FileText } from '@/components/icons';
import { Lightning } from '@/components/svg';
import { useMessages, useMobile, useSessionActivityQuery, useTimezone } from '@/components/hooks';
import { EventData } from '@/components/metrics/EventData';

export function SessionActivity({
  websiteId,
  sessionId,
  startDate,
  endDate,
}: {
  websiteId: string;
  sessionId: string;
  startDate: Date;
  endDate: Date;
}) {
  const { formatMessage, labels } = useMessages();
  const { formatTimezoneDate } = useTimezone();
  const { data, isLoading, error } = useSessionActivityQuery(
    websiteId,
    sessionId,
    startDate,
    endDate,
  );
  const { isMobile } = useMobile();
  let lastDay = null;

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <Column gap>
        {data?.map(({ eventId, createdAt, urlPath, eventName, visitId, hasData }) => {
          const showHeader = !lastDay || !isSameDay(new Date(lastDay), new Date(createdAt));
          lastDay = createdAt;

          return (
            <Column key={eventId} gap>
              {showHeader && <Heading size="1">{formatTimezoneDate(createdAt, 'PPPP')}</Heading>}
              <Row alignItems="center" gap="6" height="40px">
                <StatusLight color={`#${visitId?.substring(0, 6)}`}>
                  <Text wrap="nowrap">{formatTimezoneDate(createdAt, 'pp')}</Text>
                </StatusLight>
                <Row alignItems="center" gap="2">
                  <Icon>{eventName ? <Lightning /> : <Eye />}</Icon>
                  <Text wrap="nowrap">
                    {eventName
                      ? formatMessage(labels.triggeredEvent)
                      : formatMessage(labels.viewedPage)}
                  </Text>
                  <Text weight="bold" style={{ maxWidth: isMobile ? '400px' : null }} truncate>
                    {eventName || urlPath}
                  </Text>
                  {hasData > 0 && <PropertiesButton websiteId={websiteId} eventId={eventId} />}
                </Row>
              </Row>
            </Column>
          );
        })}
      </Column>
    </LoadingPanel>
  );
}

const PropertiesButton = props => {
  return (
    <DialogTrigger>
      <Button variant="quiet">
        <Row alignItems="center" gap>
          <Icon>
            <FileText />
          </Icon>
        </Row>
      </Button>
      <Popover placement="right">
        <Dialog>
          <EventData {...props} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};
