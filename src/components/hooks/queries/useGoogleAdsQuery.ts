import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { httpGet } from '@/lib/fetch';

export type GoogleAdsDimension = 'campaign' | 'ad_group' | 'keyword' | 'date' | 'conversion_action';

export interface GoogleAdsRow {
  /** A stable ID, or YYYY-MM-DD for the date dimension. */
  key: string;
  name: string;
  /** The campaign of an ad group, the ad group of a keyword, or the category of a conversion action. */
  parent: string | null;
  /** Keyword match type, e.g. EXACT. */
  matchType: string | null;
  /** In the account's currency. */
  cost: number;
  clicks: number;
  impressions: number;
  /** Google attributes conversions fractionally, so this may not be a whole number. */
  conversions: number;
  conversionsValue: number;
  /** Every recorded conversion, including actions that are not account goals. */
  allConversions: number;
  allConversionsValue: number;
}

export interface GoogleAdsData {
  dimension: GoogleAdsDimension;
  /** The account's ISO 4217 currency, or null when Google did not report one. */
  currencyCode: string | null;
  rows: GoogleAdsRow[];
}

export interface GoogleAdsQueryError extends Error {
  status?: number;
  code?: string;
}

// Google Ads is a Cloud integration: the data is read from Google by the Cloud app, which
// serves the dashboard on the same origin and authenticates the request with its session.
function getQueryUrl() {
  const base =
    process.env.cloudUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base.replace(/\/+$/, '')}/api/integrations/google-ads/query`;
}

export function useGoogleAdsQuery(
  {
    websiteId,
    startDate,
    endDate,
    dimension,
    limit = 10,
  }: {
    websiteId: string;
    startDate: Date;
    endDate: Date;
    dimension: GoogleAdsDimension;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  // Google reports whole days, so the range is sent as calendar dates in the viewer's timezone.
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  return useQuery<GoogleAdsData, GoogleAdsQueryError>({
    queryKey: ['google-ads', { websiteId, start, end, dimension, limit }],
    queryFn: async () => {
      const res = await httpGet(getQueryUrl(), {
        websiteId,
        startDate: start,
        endDate: end,
        dimension,
        limit,
      });

      if (!res.ok) {
        const { message, code, status } = res.data?.error || {};

        throw Object.assign(new Error(message), { code, status: status ?? res.status });
      }

      return res.data;
    },
    enabled: !!websiteId && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
    // Errors such as a missing connection are not transient; do not hammer Google on retry.
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
