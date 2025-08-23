import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from '@/lib/url';

export function useNavigation(): {
  pathname: string;
  query: { [key: string]: string };
  router: any;
  renderUrl: (params: any, reset?: boolean, removeParams?: string[]) => string;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = useMemo(() => {
    const obj = {};

    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }

    return obj;
  }, [params]);

  function renderUrl(params: any, reset?: boolean, removeParams: string[] = []) {
    if (reset) {
      return pathname;
    } else {
      const newParams = { ...query, ...params };
      removeParams.forEach(param => {
        delete newParams[param];
      });

      return buildUrl(pathname, newParams);
    }
  }

  return { pathname, query, router, renderUrl };
}

export default useNavigation;
