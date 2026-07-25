import { useEffect } from 'react';
import { setShareData, useApp } from '@/store/app';
import { useApi } from '../useApi';

export function useShareTokenQuery(slug: string) {
  const { get, useQuery } = useApi();
  const shareId = useApp(state => state.share?.shareId);
  const shareToken = useApp(state => state.shareToken?.token);
  const query = useQuery({
    queryKey: ['share', slug],
    queryFn: async () => get(`/share/${slug}`),
  });

  useEffect(() => {
    if (
      query.data?.token &&
      (shareId !== query.data.shareId || shareToken !== query.data.token)
    ) {
      setShareData(query.data, { token: query.data.token });
    }
  }, [query.data, shareId, shareToken]);

  return { share: query.data, ...query };
}
