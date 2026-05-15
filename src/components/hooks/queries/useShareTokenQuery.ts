import { setShareData } from '@/store/app';
import { useApi } from '../useApi';

export function useShareTokenQuery(slug: string) {
  const { get, useQuery } = useApi();
  const query = useQuery({
    queryKey: ['share', slug],
    queryFn: async () => {
      const data = await get(`/share/${slug}`);

      setShareData(data, { token: data?.token });

      return data;
    },
  });

  return { share: query.data, ...query };
}
