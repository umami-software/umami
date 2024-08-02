'use client';
import WebsiteHeader from '../../WebsiteHeader';
import SessionInfo from './SessionInfo';
import { useWebsiteSession } from 'components/hooks';
import { Loading } from 'react-basics';
import Avatar from 'components/common/Avatar';
import { SessionActivity } from './SessionActivity';
import { SessionStats } from './SessionStats';
import { SessionData } from './SessionData';
import styles from './SessionDetailsPage.module.css';

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
          <Avatar seed={data?.id} />
          <SessionInfo data={data} />
        </div>
        <div className={styles.content}>
          <SessionStats data={data} />
          <SessionActivity websiteId={websiteId} sessionId={sessionId} />
        </div>
        <div className={styles.data}>
          <SessionData websiteId={websiteId} sessionId={sessionId} />
        </div>
      </div>
    </>
  );
}
