import type { Metadata } from 'next';
import { isOAuthEnabled } from '@/lib/oauth/config';
import { OAuthAuthorizePage } from './OAuthAuthorizePage';

export const dynamic = 'force-dynamic';

export default async function () {
  if (!isOAuthEnabled()) {
    return null;
  }

  return <OAuthAuthorizePage />;
}

export const metadata: Metadata = {
  title: 'Authorize application',
};
