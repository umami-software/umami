import { useCallback } from 'react';
import * as reactQuery from '@tanstack/react-query';
import { getClientAuthToken } from '@/lib/client';
import { SHARE_TOKEN_HEADER } from '@/lib/constants';
import { httpGet, httpPost, httpPut, httpDelete } from '@/lib/fetch';
import useStore from '@/store/app';

const selector = (state: { shareToken: { token?: string } }) => state.shareToken;

async function handleResponse(data: any): Promise<any> {
  if (data.error) {
    return Promise.reject(new Error(data.error));
  }
  return Promise.resolve(data);
}

function handleError(err: Error | string) {
  return Promise.reject((err as Error)?.message || err || null);
}

export function useApi() {
  const shareToken = useStore(selector);

  const defaultHeaders = {
    authorization: `Bearer ${getClientAuthToken()}`,
    [SHARE_TOKEN_HEADER]: shareToken?.token,
  };
  const basePath = process.env.basePath;

  const getUrl = (url: string, basePath = '') => {
    return url.startsWith('http') ? url : `${basePath}/api${url}`;
  };

  const getHeaders = (headers: any = {}) => {
    return { ...defaultHeaders, ...headers };
  };

  return {
    get: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpGet(getUrl(url, basePath), params, getHeaders(headers))
          .then(handleResponse)
          .catch(handleError);
      },
      [httpGet],
    ),

    post: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpPost(getUrl(url, basePath), params, getHeaders(headers))
          .then(handleResponse)
          .catch(handleError);
      },
      [httpPost],
    ),

    put: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpPut(getUrl(url, basePath), params, getHeaders(headers))
          .then(handleResponse)
          .catch(handleError);
      },
      [httpPut],
    ),

    del: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpDelete(getUrl(url, basePath), params, getHeaders(headers))
          .then(handleResponse)
          .catch(handleError);
      },
      [httpDelete],
    ),
    ...reactQuery,
  };
}

export default useApi;
