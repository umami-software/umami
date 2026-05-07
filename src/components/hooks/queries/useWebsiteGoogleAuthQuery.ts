import { useApi } from '../useApi';

export interface WebsiteGoogleAuthData {
  connected: boolean;
  email: string | null;
  propertyUrl: string | null;
}

export function useWebsiteGoogleAuthQuery(websiteId: string) {
  const { get, useQuery } = useApi();

  return useQuery<WebsiteGoogleAuthData>({
    queryKey: ['website:google-auth', { websiteId }],
    queryFn: async () => get(`/websites/${websiteId}/google-auth`),
    enabled: !!websiteId,
  });
}
