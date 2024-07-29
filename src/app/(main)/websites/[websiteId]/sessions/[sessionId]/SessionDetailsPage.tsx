'use client';
import WebsiteHeader from '../../WebsiteHeader';
import SessionInfo from './SessionInfo';
import { useSession } from 'components/hooks';
import { Loading } from 'react-basics';
import Profile from 'components/common/Profile';
import styles from './SessionDetailsPage.module.css';

export default function SessionDetailsPage({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data, isLoading } = useSession(websiteId, sessionId);

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
        <div className={styles.content}>oh hi.</div>
      </div>
    </>
  );
}
