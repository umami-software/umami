import { GridTable, GridColumn, Icon } from 'react-basics';
import { useLocale, useMessages, useTeamUrl } from 'components/hooks';
import Empty from 'components/common/Empty';
import Avatar from 'components/common/Avatar';
import Link from 'next/link';
import Icons from 'components/icons';
import { formatDate } from 'lib/date';

export function EventsTable({ data = [] }) {
  const { locale } = useLocale();
  const { formatMessage, labels } = useMessages();
  const { renderTeamUrl } = useTeamUrl();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="session" label={formatMessage(labels.session)} width={'100px'}>
        {row => (
          <Link href={renderTeamUrl(`/websites/${row.websiteId}/sessions/${row.sessionId}`)}>
            <Avatar seed={row.sessionId} size={64} />
          </Link>
        )}
      </GridColumn>
      <GridColumn name="event" label={formatMessage(labels.event)}>
        {row => {
          return (
            <>
              <Icon>{row.eventName ? <Icons.Bolt /> : <Icons.Eye />}</Icon>
              {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              <strong>{row.eventName || row.urlPath}</strong>
            </>
          );
        }}
      </GridColumn>
      <GridColumn name="created" label={formatMessage(labels.created)} width={'300px'}>
        {row => formatDate(new Date(row.createdAt), 'PPPpp', locale)}
      </GridColumn>
    </GridTable>
  );
}

export default EventsTable;
