import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { get, post, put, del, getItem } from 'lib/web';
import { AUTH_TOKEN, SHARE_TOKEN_HEADER } from 'lib/constants';
import useStore from 'store/app';

const selector = state => state.shareToken;

function parseHeaders(headers, { authToken, shareToken }) {
  if (authToken) {
    headers.authorization = `Bearer ${authToken}`;
  }

  if (shareToken) {
    headers[SHARE_TOKEN_HEADER] = shareToken.token;
  }

  return headers;
}

export default function useApi() {
  const { basePath } = useRouter();
  const authToken = getItem(AUTH_TOKEN);
  const shareToken = useStore(selector);

  return {
    get: useCallback(
      async (url, params = {}, headers = {}) => {
        return get(
          `${basePath}/api${url}`,
          params,
          parseHeaders(headers, { authToken, shareToken }),
        );
      },
      [get],
    ),

    post: useCallback(
      async (url, params = {}, headers = {}) => {
        return post(
          `${basePath}/api${url}`,
          params,
          parseHeaders(headers, { authToken, shareToken }),
        );
      },
      [post],
    ),

    put: useCallback(
      async (url, params = {}, headers = {}) => {
        return put(
          `${basePath}/api${url}`,
          params,
          parseHeaders(headers, { authToken, shareToken }),
        );
      },
      [put],
    ),

    del: useCallback(
      async (url, params = {}, headers = {}) => {
        return del(
          `${basePath}/api${url}`,
          params,
          parseHeaders(headers, { authToken, shareToken }),
        );
      },
      [del],
    ),
  };
}
