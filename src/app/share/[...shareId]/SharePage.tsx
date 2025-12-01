'use client';
import { Column } from '@umami/react-zen';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { useShareTokenQuery } from '@/components/hooks';
import { Footer } from './Footer';
import { Header } from './Header';

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);

  if (isLoading || !shareToken) {
    return null;
  }

  return (
    <Column backgroundColor="2">
      <PageBody gap>
        <Header />
        <WebsiteProvider websiteId={shareToken.websiteId}>
          <WebsiteHeader showActions={false} />
          <WebsitePage websiteId={shareToken.websiteId} />
        </WebsiteProvider>
        <Footer />
      </PageBody>
    </Column>
  );
}
