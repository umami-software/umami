import { useQuery } from '@tanstack/react-query';
import { httpGet } from '@/lib/fetch';

export interface AdsConnection {
  id: string;
  /** e.g. google_ads. */
  provider: string;
  /** The ad account's name, when the provider reported one. */
  name: string | null;
  /** The provider's ID for the ad account, e.g. a Google Ads customer ID. */
  accountId: string;
  currencyCode: string | null;
  createdAt: string;
}

// Like the reports, the connections are read from the Cloud app on the dashboard's origin.
function getQueryUrl() {
  const base =
    process.env.cloudUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base.replace(/\/+$/, '')}/api/integrations/ads/connections`;
}

/** The ad accounts connected to a website, newest first. */
export function useAdsConnectionsQuery(websiteId: string, options?: { enabled?: boolean }) {
  return useQuery<AdsConnection[]>({
    queryKey: ['ads-connections', { websiteId }],
    queryFn: async () => {
      const res = await httpGet(getQueryUrl(), { websiteId });

      if (!res.ok) {
        const { message, code, status } = res.data?.error || {};

        throw Object.assign(new Error(message), { code, status: status ?? res.status });
      }

      return res.data;
    },
    enabled: !!websiteId && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
