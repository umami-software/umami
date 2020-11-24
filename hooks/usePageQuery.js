import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { getQueryString } from 'lib/url';

export default function usePageQuery() {
  const router = useRouter();
  const { pathname, search } = location;

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
    const search = getQueryString({ ...query, ...params });

    const { asPath } = router;

    return `${asPath.split('?')[0]}${search}`;
  }

  return { pathname, query, resolve, router };
}
