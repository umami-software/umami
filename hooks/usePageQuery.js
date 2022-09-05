import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { buildUrl } from 'next-basics';

export default function usePageQuery() {
  const router = useRouter();
  const { pathname, search } = location;
  const { asPath } = router;

  const query = useMemo(() => {
    if (!search) {
      return {};
    }

    const params = search.substring(1).split('&');

    return params.reduce((obj, item) => {
      const [key, value] = item.split('=');

      obj[key] = decodeURIComponent(value);

      return obj;
    }, {});
  }, [search]);

  function resolve(params) {
    return buildUrl(asPath.split('?')[0], { ...query, ...params });
  }

  return { pathname, query, resolve, router };
}
