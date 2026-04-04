import { setShare, setShareToken, useApp } from '@/store/app';
import { useApi } from '../useApi';

const selector = state => state.share;

export function useShareTokenQuery(slug: string) {
  const share = useApp(selector);
  const { get, useQuery } = useApi();
  const query = useQuery({
    queryKey: ['share', slug],
    queryFn: async () => {
      const data = await get(`/share/${slug}`);

      setShare(data);
      setShareToken({ token: data?.token });

      return data;
    },
  });

  return { share, ...query };
}
