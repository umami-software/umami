import { DataTable, DataColumn, Icon, Row } from '@umami/react-zen';
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
            <Row alignItems="center" gap>
              <Link href={renderUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
                <Avatar seed={row.sessionId} size={32} />
              </Link>
              <Icon>{row.eventName ? <Bolt /> : <Eye />}</Icon>
              {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              <strong>{row.eventName || row.urlPath}</strong>
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
      <DataColumn id="browser" label={formatMessage(labels.browser)}>
        {(row: any) => (
          <TypeIcon type="browser" value={row.browser}>
            {formatValue(row.browser, 'browser')}
          </TypeIcon>
        )}
      </DataColumn>
      <DataColumn id="device" label={formatMessage(labels.device)}>
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
