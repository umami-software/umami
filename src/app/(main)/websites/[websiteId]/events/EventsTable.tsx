import { DataTable, DataColumn, Icon, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import Link from 'next/link';
import { Bolt, Eye } from '@/components/icons';
import { DateDistance } from '@/components/common/DateDistance';
import { TypeIcon } from '@/components/common/TypeIcon';

export function EventsTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { renderUrl } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
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
      <DataColumn id="created" width="1fr" align="end">
        {(row: any) => (
          <Row alignItems="center" gap>
            <DateDistance date={new Date(row.createdAt)} />
            <Link href={renderUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
              <Avatar seed={row.sessionId} size={32} />
            </Link>
            <Row alignItems="center" gap="1">
              <TypeIcon type="country" value={row.country} />
              <TypeIcon type="browser" value={row.browser} />
              <TypeIcon type="os" value={row.os} />
              <TypeIcon type="device" value={row.device} />
            </Row>
          </Row>
        )}
      </DataColumn>
    </DataTable>
  );
}
