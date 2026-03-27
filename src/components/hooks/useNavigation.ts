import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildPath } from '@/lib/url';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, teamId] = pathname.match(/\/teams\/([a-f0-9-]+)/) || [];
  const [, websiteId] = pathname.match(/\/websites\/([a-f0-9-]+)/) || [];
  const queryParams = Object.fromEntries(searchParams.entries());

  const updateParams = (params?: Record<string, string | number | undefined>) => {
    return buildPath(pathname, { ...queryParams, ...params });
  };

  const replaceParams = (params?: Record<string, string | number | undefined>) => {
    return buildPath(pathname, params);
  };

  const renderUrl = (
    path: string,
    params?: Record<string, string | number | undefined> | false,
  ) => {
    return buildPath(
      teamId ? `/teams/${teamId}${path}` : path,
      params === false ? {} : { ...queryParams, ...params },
    );
  };

  return {
    router,
    pathname,
    searchParams,
    query: queryParams,
    teamId,
    websiteId,
    updateParams,
    replaceParams,
    renderUrl,
  };
}
