import type { Metadata } from 'next';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setDateRangeValue, setBoardDateRangeValue } from '@/store/app';
import { getItem } from '@/lib/storage';
import { DATE_RANGE_CONFIG } from '@/lib/constants';
import { WebsitesPage } from './WebsitesPage';

export default function Page({ params }: { params: { websiteId?: string } }) {
  const websiteId = params?.websiteId;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!websiteId) return;

    const urlRange = searchParams.get('range');
    const savedRange = getItem(`${DATE_RANGE_CONFIG}:${websiteId}`);

    if (urlRange) {
      try {
        const parsedRange = urlRange.startsWith('{') ? JSON.parse(urlRange) : urlRange;
        setBoardDateRangeValue(parsedRange, websiteId);
      } catch {
        setBoardDateRangeValue(urlRange, websiteId);
      }
    } else if (savedRange) {
      try {
        const parsedRange = savedRange.startsWith('{') ? JSON.parse(savedRange) : savedRange;
        setDateRangeValue(parsedRange);
      } catch {
        setDateRangeValue(savedRange);
      }
    }
  }, [websiteId, searchParams]);

  return <WebsitesPage />;
}

export const metadata: Metadata = {
  title: 'Websites',
};