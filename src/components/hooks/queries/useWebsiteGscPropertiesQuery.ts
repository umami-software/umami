import type { GscProperty } from '@/lib/google';
import { useApi } from '../useApi';

export function useWebsiteGscPropertiesQuery(websiteId: string, enabled: boolean) {
  const { get, useQuery } = useApi();

  return useQuery<Array<GscProperty>>({
    queryKey: ['website:gsc-properties', { websiteId }],
    queryFn: async () => {
      const res = await get(`/websites/${websiteId}/google-auth/properties`);
      // Sort alphabetically for consistent ordering
      return (res.properties ?? []).sort((a: GscProperty, b: GscProperty) =>
        a.siteUrl.localeCompare(b.siteUrl),
      );
    },
    enabled: !!websiteId && enabled,
  });
}
