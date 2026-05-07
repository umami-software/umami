import { useApi } from '../useApi';

export function useWebsiteGscPropertyMutation(websiteId: string) {
  const { put, useMutation } = useApi();

  return useMutation({
    mutationFn: (propertyUrl: string) =>
      put(`/websites/${websiteId}/google-auth/property`, { propertyUrl }),
  });
}
