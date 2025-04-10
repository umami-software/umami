import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from '@/lib/url';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, teamId] = pathname.match(/^\/teams\/([a-f0-9-]+)/) || [];

  const query = useMemo<{ [key: string]: any }>(() => {
    const obj = {};

    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }

    return obj;
  }, [params]);

  function renderUrl(params: any) {
    return !params ? pathname : buildUrl(pathname, { ...query, ...params });
  }

  function renderTeamUrl(url: string) {
    return teamId ? `/teams/${teamId}${url}` : url;
  }

  return { pathname, query, router, renderUrl, renderTeamUrl, teamId };
}
