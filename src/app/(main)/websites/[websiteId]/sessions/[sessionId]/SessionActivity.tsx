import { isSameDay } from 'date-fns';
import { Loading, Icon, StatusLight } from 'react-basics';
import Icons from 'components/icons';
import { useSessionActivity, useTimezone } from 'components/hooks';
import styles from './SessionActivity.module.css';

export function SessionActivity({
  websiteId,
  sessionId,
  startDate,
  endDate,
}: {
  websiteId: string;
  sessionId: string;
  startDate: Date;
  endDate: Date;
}) {
  const { formatTimezoneDate } = useTimezone();
  const { data, isLoading } = useSessionActivity(websiteId, sessionId, startDate, endDate);

  if (isLoading) {
    return <Loading position="page" />;
  }

  let lastDay = null;

  return (
    <div className={styles.timeline}>
      {data.map(({ eventId, createdAt, urlPath, eventName, visitId }) => {
        const showHeader = !lastDay || !isSameDay(new Date(lastDay), new Date(createdAt));
        lastDay = createdAt;

        return (
          <>
            {showHeader && (
              <div className={styles.header}>{formatTimezoneDate(createdAt, 'EEEE, PPP')}</div>
            )}
            <div key={eventId} className={styles.row}>
              <div className={styles.time}>
                <StatusLight color={`#${visitId?.substring(0, 6)}`}>
                  {formatTimezoneDate(createdAt, 'h:mm:ss aaa')}
                </StatusLight>
              </div>
              <Icon>{eventName ? <Icons.Bolt /> : <Icons.Eye />}</Icon>
              <div className={styles.value}>{eventName || urlPath}</div>
            </div>
          </>
        );
      })}
    </div>
  );
}
