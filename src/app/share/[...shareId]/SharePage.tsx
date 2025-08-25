'use client';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { useShareTokenQuery } from '@/components/hooks';
import { PageBody } from '@/components/common/PageBody';
import { Header } from './Header';
import { Footer } from './Footer';

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);

  if (isLoading || !shareToken) {
    return null;
  }

  return (
    <PageBody>
      <Header />
      <WebsiteProvider websiteId={shareToken.websiteId}>
        <WebsitePage websiteId={shareToken.websiteId} />
      </WebsiteProvider>
      <Footer />
    </PageBody>
  );
}
