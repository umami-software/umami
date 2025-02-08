'use client';
import Avatar from '@/components/common/Avatar';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useWebsiteSession } from '@/components/hooks';
import WebsiteHeader from '../../WebsiteHeader';
import { SessionActivity } from './SessionActivity';
import { SessionData } from './SessionData';
import styles from './SessionDetailsPage.module.css';
import SessionInfo from './SessionInfo';
import { SessionStats } from './SessionStats';

export default function SessionDetailsPage({
  websiteId,
  sessionId,
}: {
  websiteId: string;
  sessionId: string;
}) {
  const { data, ...query } = useWebsiteSession(websiteId, sessionId);

  return (
    <LoadingPanel {...query} loadingIcon="spinner" data={data}>
      <WebsiteHeader websiteId={websiteId} />
      <div className={styles.page}>
        <div className={styles.sidebar}>
          <Avatar seed={data?.id} />
          <SessionInfo data={data} />
        </div>
        <div className={styles.content}>
          <SessionStats data={data} />
          <SessionActivity
            websiteId={websiteId}
            sessionId={sessionId}
            startDate={data?.firstAt}
            endDate={data?.lastAt}
          />
        </div>
        <div className={styles.data}>
          <SessionData websiteId={websiteId} sessionId={sessionId} />
        </div>
      </div>
    </LoadingPanel>
  );
}
