import { DataTable, DataColumn, Icon, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import Link from 'next/link';
import { Bolt, Eye } from '@/components/icons';
import { DateDistance } from '@/components/common/DateDistance';

export function EventsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="session" label={formatMessage(labels.session)} width="100px">
        {(row: any) => (
          <Link href={renderUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
            <Avatar seed={row.sessionId} size={64} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="event" label={formatMessage(labels.event)} width="2fr">
        {(row: any) => {
          return (
            <Row alignItems="center" gap="2">
              <Icon>{row.eventName ? <Bolt /> : <Eye />}</Icon>
              {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              <strong>{row.eventName || row.urlPath}</strong>
            </Row>
          );
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
    </DataTable>
  );
}
