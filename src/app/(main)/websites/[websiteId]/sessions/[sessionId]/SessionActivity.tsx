import { formatDate } from 'lib/date';
import { isSameDay } from 'date-fns';
import { Loading, Icon, StatusLight } from 'react-basics';
import Icons from 'components/icons';
import { useLocale, useSessionActivity } from 'components/hooks';
import styles from './SessionActivity.module.css';

export function SessionActivity({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { locale } = useLocale();
  const { data, isLoading } = useSessionActivity(websiteId, sessionId);

  if (isLoading) {
    return <Loading position="page" />;
  }

  let lastDay = null;

  return (
    <div className={styles.timeline}>
      <h1>Activity log</h1>
      {data.map(({ eventId, createdAt, urlPath, eventName, visitId }) => {
        const showHeader = !lastDay || !isSameDay(new Date(lastDay), new Date(createdAt));
        lastDay = createdAt;

        return (
          <>
            {showHeader && (
              <div className={styles.header}>
                {formatDate(new Date(createdAt), 'EEEE, PPP', locale)}
              </div>
            )}
            <div key={eventId} className={styles.row}>
              <div className={styles.time}>
                <StatusLight color={`#${visitId?.substring(0, 6)}`}>
                  {formatDate(new Date(createdAt), 'h:mm:ss aaa', locale)}
                </StatusLight>
              </div>
              <Icon>{eventName ? <Icons.Bolt /> : <Icons.Eye />}</Icon>
              <div>{eventName || urlPath}</div>
            </div>
          </>
        );
      })}
    </div>
  );
}
