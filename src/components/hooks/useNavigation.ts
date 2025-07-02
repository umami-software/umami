import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from '@/lib/url';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, teamId] = pathname.match(/\/teams\/([a-f0-9-]+)/) || [];
  const [, websiteId] = pathname.match(/\/websites\/([a-f0-9-]+)/) || [];
  const query = Object.fromEntries(searchParams);

  const updateParams = (params?: Record<string, string | number>) => {
    return !params ? pathname : buildUrl(pathname, { ...query, ...params });
  };

  const renderUrl = (path: string, params?: Record<string, string | number> | false) => {
    return buildUrl(
      teamId ? `/teams/${teamId}${path}` : path,
      params === false ? {} : { ...query, ...params },
    );
  };

  return { router, pathname, searchParams, query, teamId, websiteId, updateParams, renderUrl };
}
