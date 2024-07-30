'use client';
import WebsiteHeader from '../../WebsiteHeader';
import SessionInfo from './SessionInfo';
import { useWebsiteSession } from 'components/hooks';
import { Loading } from 'react-basics';
import Profile from 'components/common/Profile';
import styles from './SessionDetailsPage.module.css';
import { SessionActivity } from './SessionActivity';
import SessionStats from './SessionStats';

export default function SessionDetailsPage({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data, isLoading } = useWebsiteSession(websiteId, sessionId);

  if (isLoading) {
    return <Loading position="page" />;
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <div className={styles.page}>
        <div className={styles.sidebar}>
          <Profile seed={data?.id} />
          <SessionInfo data={data} />
        </div>
        <div className={styles.content}>
          <SessionActivity websiteId={websiteId} sessionId={sessionId} />
        </div>
        <div className={styles.stats}>
          <SessionStats data={data} />
        </div>
      </div>
    </>
  );
}
