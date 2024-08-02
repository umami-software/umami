import { GridTable, GridColumn } from 'react-basics';
import { useLocale, useMessages } from 'components/hooks';
import Empty from 'components/common/Empty';
import { formatDistance } from 'date-fns';
import Avatar from 'components/common/Avatar';
import Link from 'next/link';

export function EventsTable({ data = [] }) {
  const { dateLocale } = useLocale();
  const { formatMessage, labels } = useMessages();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="session" label={formatMessage(labels.session)} width={'100px'}>
        {row => (
          <Link href={`/sessions/`}>
            <Avatar seed={row.sessionId} size={64} />
          </Link>
        )}
      </GridColumn>
      <GridColumn name="event" label={formatMessage(labels.event)}>
        {row => {
          return (
            <>
              {formatMessage(row.eventName ? labels.triggeredEvent : labels.viewedPage)}
              <strong>{row.eventName}</strong>
            </>
          );
        }}
      </GridColumn>
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
