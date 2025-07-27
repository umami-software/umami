import { DataTable, DataColumn, Icon, Row, Text } from '@umami/react-zen';
import { useFormat, useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import Link from 'next/link';
import { Bolt, Eye } from '@/components/icons';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';

export function EventsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();
  const { formatValue } = useFormat();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="event" label={formatMessage(labels.event)} width="2fr">
        {(row: any) => {
          return (
            <Row alignItems="center" gap="2">
              <Link href={renderUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
                <Avatar seed={row.sessionId} size={32} />
              </Link>
              <Icon>{row.eventName ? <Bolt /> : <Eye />}</Icon>
              <Text>
                {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              </Text>
              <Text weight="bold" truncate>
                {row.eventName || row.urlPath}
              </Text>
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="location" label={formatMessage(labels.location)}>
        {(row: any) => (
          <TypeIcon type="country" value={row.country}>
            {row.city ? `${row.city}, ` : ''} {formatValue(row.country, 'country')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="browser" label={formatMessage(labels.browser)} width="140px">
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)} width="120px">
        {(row: any) => (
          <TypeIcon type="device" value={row.device}>
            {formatValue(row.device, 'device')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="created" width="160px" align="end">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
