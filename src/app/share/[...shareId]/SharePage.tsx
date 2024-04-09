'use client';
import WebsiteDetails from 'app/(main)/websites/[websiteId]/WebsiteDetails';
import { useShareToken } from 'components/hooks';
import { useEffect } from 'react';
import Page from 'components/layout/Page';
import Header from './Header';
import styles from './SharePage.module.css';

export default function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareToken(shareId);

  if (isLoading || !shareToken) {
    return null;
  }
  useEffect(() => {
    function sendHeightToParent() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ height: height }, '*');
    }

    sendHeightToParent();

    // Add event listener for resize
    window.addEventListener('resize', () => {
      sendHeightToParent();
    });

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', () => {
        sendHeightToParent();
      });
    };
  }, [])
  return (
    <div className={styles.container}>
      <Page>
        <Header />
        <WebsiteDetails websiteId={shareToken.websiteId} />
      </Page>
    </div>
  );
}
