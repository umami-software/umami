'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setBoardDateRangeValue } from '@/store/app';
import { getItem } from '@/lib/storage';
import { DATE_RANGE_CONFIG } from '@/lib/constants';

export function WebsiteHydrator({ websiteId }: { websiteId: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!websiteId) return;

    const urlRange = searchParams.get('range');
    const savedRange = getItem(`${DATE_RANGE_CONFIG}:${websiteId}`);

    if (urlRange) {
      try {
        const parsedRange = typeof urlRange === 'string' && urlRange.startsWith('{')
          ? JSON.parse(urlRange)
          : urlRange;
        setBoardDateRangeValue(parsedRange, websiteId);
      } catch {
        setBoardDateRangeValue(urlRange, websiteId);
      }
    } else if (savedRange) {
      try {
        const parsedRange = typeof savedRange === 'string' && savedRange.startsWith('{')
          ? JSON.parse(savedRange)
          : savedRange;
        setBoardDateRangeValue(parsedRange, websiteId);
      } catch {
        setBoardDateRangeValue(savedRange, websiteId);
      }
    }
  }, [websiteId, searchParams]);

  return null;
}