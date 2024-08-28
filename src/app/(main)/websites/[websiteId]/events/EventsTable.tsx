import { GridTable, GridColumn, Icon } from 'react-basics';
import { useMessages, useTeamUrl, useTimezone } from 'components/hooks';
import Empty from 'components/common/Empty';
import Avatar from 'components/common/Avatar';
import Link from 'next/link';
import Icons from 'components/icons';
import { useIntl } from 'react-intl';

export function EventsTable({ data = [] }) {
  const intl = useIntl();
  const { formatTimezoneDate } = useTimezone();
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
        {row => formatTimezoneDate(intl, row.createdAt, { dateStyle: 'long', timeStyle: 'medium' })}
      </GridColumn>
    </GridTable>
  );
}

export default EventsTable;
