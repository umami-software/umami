import { isSameDay } from 'date-fns';
import { Icon, StatusLight, Column, Row, Heading, Text, Button } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Bolt, Eye, FileText } from '@/components/icons';
import { useSessionActivityQuery, useTimezone } from '@/components/hooks';

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
  const { formatTimezoneDate } = useTimezone();
  const { data, isLoading, error } = useSessionActivityQuery(
    websiteId,
    sessionId,
    startDate,
    endDate,
  );
  let lastDay = null;

  return (
    <LoadingPanel isEmpty={!data?.length} isLoading={isLoading} error={error}>
      <Column gap>
        {data?.map(({ eventId, createdAt, urlPath, eventName, visitId, hasData }) => {
          const showHeader = !lastDay || !isSameDay(new Date(lastDay), new Date(createdAt));
          lastDay = createdAt;

          return (
            <Column key={eventId} gap>
              {showHeader && <Heading size="2">{formatTimezoneDate(createdAt, 'PPPP')}</Heading>}
              <Row alignItems="center" gap="6" height="40px">
                <StatusLight color={`#${visitId?.substring(0, 6)}`}>
                  {formatTimezoneDate(createdAt, 'pp')}
                </StatusLight>
                <Row alignItems="center" gap>
                  <Icon>{eventName ? <Bolt /> : <Eye />}</Icon>
                  <Text>{eventName || urlPath}</Text>
                  {hasData > 0 && (
                    <Button variant="quiet">
                      <Row alignItems="center" gap>
                        <Icon>
                          <FileText />
                        </Icon>
                      </Row>
                    </Button>
                  )}
                </Row>
              </Row>
            </Column>
          );
        })}
      </Column>
    </LoadingPanel>
  );
}
