import { useApp, setShareToken } from '@/store/app';
import { useApi } from '../useApi';

const selector = (state: { shareToken: string }) => state.shareToken;

export function useShareTokenQuery(shareId: string): {
  shareToken: any;
  isLoading?: boolean;
  error?: Error;
} {
  const shareToken = useApp(selector);
  const { get, useQuery } = useApi();
  const { isLoading, error } = useQuery({
    queryKey: ['share', shareId],
    queryFn: async () => {
      const data = await get(`/share/${shareId}`);

      setShareToken(data);

      return data;
    },
  });

  return { shareToken, isLoading, error };
}
