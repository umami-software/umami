'use client';
import { Column, useTheme } from '@umami/react-zen';
import { useEffect } from 'react';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { useShareTokenQuery } from '@/components/hooks';
import { Footer } from './Footer';
import { Header } from './Header';

export function SharePage({ shareId }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);
  const { setTheme } = useTheme();

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const theme = url.searchParams.get('theme');

    if (theme === 'light' || theme === 'dark') {
      setTheme(theme);
    }
  }, []);

  if (isLoading || !shareToken) {
    return null;
  }

  const { whiteLabel } = shareToken;

  return (
    <Column backgroundColor="2">
      <PageBody gap>
        <Header whiteLabel={whiteLabel} />
        <WebsiteProvider websiteId={shareToken.websiteId}>
          <WebsiteHeader showActions={false} allowLink={false} />
          <WebsitePage websiteId={shareToken.websiteId} />
        </WebsiteProvider>
        <Footer whiteLabel={whiteLabel} />
      </PageBody>
    </Column>
  );
}
