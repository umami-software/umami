import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { del } from 'lib/web';

export default function useDelete() {
  const { basePath } = useRouter();

  return useCallback(async (url, params, headers) => {
    return del(`${basePath}${url}`, params, headers);
  }, []);
}
