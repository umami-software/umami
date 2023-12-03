import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from 'next-basics';

export function useNavigation(): {
  pathname: string;
  query: { [key: string]: string };
  router: any;
  makeUrl: (params: any, reset?: boolean) => string;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = useMemo(() => {
    const obj = {};

    for (const [key, value] of params.entries()) {
      obj[key] = decodeURIComponent(value);
    }

    return obj;
  }, [params]);

  function makeUrl(params: any, reset?: boolean) {
    return reset ? pathname : buildUrl(pathname, { ...query, ...params });
  }

  return { pathname, query, router, makeUrl };
}

export default useNavigation;
