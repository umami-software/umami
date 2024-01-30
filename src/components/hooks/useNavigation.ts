import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from 'next-basics';

export function useNavigation(): {
  pathname: string;
  query: { [key: string]: string };
  router: any;
  renderUrl: (params: any, reset?: boolean) => string;
  renderTeamUrl: (url: string) => string;
  teamId?: string;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, teamId] = pathname.match(/^\/teams\/([a-f0-9-]+)/) || [];

  const query = useMemo(() => {
    const obj = {};

    for (const [key, value] of params.entries()) {
      obj[key] = decodeURIComponent(value);
    }

    return obj;
  }, [params]);

  function renderUrl(params: any, reset?: boolean) {
    return reset ? pathname : buildUrl(pathname, { ...query, ...params });
  }

  function renderTeamUrl(url: string) {
    return teamId ? `/teams/${teamId}${url}` : url;
  }

  return { pathname, query, router, renderUrl, renderTeamUrl, teamId };
}

export default useNavigation;
