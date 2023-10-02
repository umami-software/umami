import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUrl } from 'next-basics';

export function usePageQuery() {
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

  function resolveUrl(params, reset) {
    return buildUrl(pathname, { ...(reset ? {} : query) });
  }

  return { pathname, query, resolveUrl, router };
}

export default usePageQuery;
