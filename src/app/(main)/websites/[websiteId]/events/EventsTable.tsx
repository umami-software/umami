import { DataTable, DataColumn, Icon } from '@umami/react-zen';
import { useMessages, useNavigation, useTimezone } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export function EventsTable({ data = [] }) {
  const { formatTimezoneDate } = useTimezone();
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="session" label={formatMessage(labels.session)}>
        {(row: any) => (
          <Link href={renderTeamUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
            <Avatar seed={row.sessionId} size={64} />
          </Link>
        )}
      </DataColumn>
      <DataColumn id="event" label={formatMessage(labels.event)}>
        {(row: any) => {
          return (
            <>
              <Icon>{row.eventName ? <Icons.Bolt /> : <Icons.Eye />}</Icon>
              {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              <strong>{row.eventName || row.urlPath}</strong>
            </>
          );
        }}
      </DataColumn>
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => formatTimezoneDate(row.createdAt, 'PPPpp')}
      </DataColumn>
    </DataTable>
  );
}
