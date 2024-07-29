'use client';
import WebsiteHeader from '../../WebsiteHeader';
import SessionInfo from './SessionInfo';
import { useSession } from 'components/hooks';
import { Loading } from 'react-basics';
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
    <div className={styles.page}>
      <WebsiteHeader websiteId={websiteId} />
      <SessionInfo data={data} />
    </div>
  );
}
