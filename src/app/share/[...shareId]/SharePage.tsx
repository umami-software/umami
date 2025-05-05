'use client';
import { WebsiteProvider } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { WebsiteDetailsPage } from '@/app/(main)/websites/[websiteId]/WebsiteDetailsPage';
import { useShareTokenQuery } from '@/components/hooks';
import { Page } from '@/components/common/Page';
import { Header } from './Header';
import { Footer } from './Footer';

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);

  if (isLoading || !shareToken) {
    return null;
  }

  return (
    <Page>
      <Header />
      <WebsiteProvider websiteId={shareToken.websiteId}>
        <WebsiteDetailsPage websiteId={shareToken.websiteId} />
      </WebsiteProvider>
      <Footer />
    </Page>
  );
}
