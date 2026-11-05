import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GoogleAdsPage } from './GoogleAdsPage';

export default async function Page({ params }: { params: Promise<{ websiteId: string }> }) {
  // Google Ads is a Cloud integration.
  if (!process.env.cloudMode) {
    notFound();
  }

  const { websiteId } = await params;

  return <GoogleAdsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Ads',
};
