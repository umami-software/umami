'use client';
import { WebsiteDetailsPage } from '../../(main)/websites/[websiteId]/WebsiteDetailsPage';
import { useShareTokenQuery } from '@/components/hooks';
import { Page } from '@/components/common/Page';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './SharePage.module.css';
import { WebsiteProvider } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);

  if (isLoading || !shareToken) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Page>
        <Header />
        <WebsiteProvider websiteId={shareToken.websiteId}>
          <WebsiteDetailsPage websiteId={shareToken.websiteId} />
        </WebsiteProvider>
        <Footer />
      </Page>
    </div>
  );
}
