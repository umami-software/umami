import { GridTable, GridColumn } from 'react-basics';
import { useLocale, useMessages } from 'components/hooks';
import Empty from 'components/common/Empty';
import { formatDistance } from 'date-fns';
import Profile from 'components/common/Profile';
import Link from 'next/link';

export function EventsTable({ data = [] }) {
  const { dateLocale } = useLocale();
  const { formatMessage, labels } = useMessages();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="id" label="ID" />
      <GridColumn name="session" label={formatMessage(labels.session)}>
        {row => (
          <Link href={`/sessions/`}>
            <Profile seed={row.sessionId} size={64} />
          </Link>
        )}
      </GridColumn>
      <GridColumn name="eventName" label={formatMessage(labels.event)}>
        {row => formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
      </GridColumn>
      <GridColumn name="eventName" label={formatMessage(labels.name)} />
      <GridColumn name="urlPath" label={formatMessage(labels.path)} />
      <GridColumn name="created" label={formatMessage(labels.created)}>
        {row =>
          formatDistance(new Date(row.createdAt), new Date(), {
            addSuffix: true,
            locale: dateLocale,
          })
        }
      </GridColumn>
    </GridTable>
  );
}

export default EventsTable;
