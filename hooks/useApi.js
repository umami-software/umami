import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { get, post, put, del } from 'lib/web';

export default function useApi() {
  const { basePath } = useRouter();

  return {
    get: useCallback(async (url, params, headers) => {
      return get(`${basePath}/api/${url}`, params, headers);
    }, []),

    post: useCallback(async (url, params, headers) => {
      return post(`${basePath}/api/${url}`, params, headers);
    }, []),

    put: useCallback(async (url, params, headers) => {
      return put(`${basePath}/api/${url}`, params, headers);
    }, []),

    del: useCallback(async (url, params, headers) => {
      return del(`${basePath}/api/${url}`, params, headers);
    }, []),
  };
}
