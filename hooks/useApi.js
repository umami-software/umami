import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { get, post, put, del, getItem } from 'lib/web';
import { AUTH_TOKEN } from 'lib/constants';

function includeAuthToken(headers = {}) {
  const authToken = getItem(AUTH_TOKEN);

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

export default function useApi() {
  const { basePath } = useRouter();

  return {
    get: useCallback(
      async (url, params, headers) => {
        return get(`${basePath}/api${url}`, params, includeAuthToken(headers));
      },
      [get],
    ),

    post: useCallback(
      async (url, params, headers) => {
        return post(`${basePath}/api${url}`, params, includeAuthToken(headers));
      },
      [post],
    ),

    put: useCallback(
      async (url, params, headers) => {
        return put(`${basePath}/api${url}`, params, includeAuthToken(headers));
      },
      [put],
    ),

    del: useCallback(
      async (url, params, headers) => {
        return del(`${basePath}/api${url}`, params, includeAuthToken(headers));
      },
      [del],
    ),
  };
}
