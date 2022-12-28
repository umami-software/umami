import { useApi as nextUseApi } from 'next-basics';
import { getClientAuthToken } from 'lib/client';
import { useRouter } from 'next/router';

export function useApi() {
  const { basePath } = useRouter();

  const { get, post, put, del } = nextUseApi(getClientAuthToken(), basePath);

  return { get, post, put, del };
}

export default useApi;
