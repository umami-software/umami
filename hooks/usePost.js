import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { post } from 'lib/web';

export default function usePost() {
  const { basePath } = useRouter();

  return useCallback(async (url, params, headers) => {
    return post(`${basePath}${url}`, params, headers);
  }, []);
}
