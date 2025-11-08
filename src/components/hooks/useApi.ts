import { useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getClientAuthToken } from '@/lib/client';
import { SHARE_TOKEN_HEADER } from '@/lib/constants';
import { httpGet, httpPost, httpPut, httpDelete, FetchResponse } from '@/lib/fetch';
import { useApp } from '@/store/app';

const selector = (state: { shareToken: { token?: string } }) => state.shareToken;

async function handleResponse(res: FetchResponse): Promise<any> {
  if (!res.ok) {
    const { message, code, status } = res?.data?.error || {};

    return Promise.reject(Object.assign(new Error(message), { code, status }));
  }
  return Promise.resolve(res.data);
}

export function useApi() {
  const shareToken = useApp(selector);

  const defaultHeaders = {
    authorization: `Bearer ${getClientAuthToken()}`,
    [SHARE_TOKEN_HEADER]: shareToken?.token,
  };
  const basePath = process.env.basePath;

  const getUrl = (url: string) => {
    return url.startsWith('http') ? url : `${basePath || ''}/api${url}`;
  };

  const getHeaders = (headers: any = {}) => {
    return { ...defaultHeaders, ...headers };
  };

  return {
    get: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpGet(getUrl(url), params, getHeaders(headers)).then(handleResponse);
      },
      [httpGet],
    ),

    post: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpPost(getUrl(url), params, getHeaders(headers)).then(handleResponse);
      },
      [httpPost],
    ),

    put: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpPut(getUrl(url), params, getHeaders(headers)).then(handleResponse);
      },
      [httpPut],
    ),

    del: useCallback(
      async (url: string, params: object = {}, headers: object = {}) => {
        return httpDelete(getUrl(url), params, getHeaders(headers)).then(handleResponse);
      },
      [httpDelete],
    ),
    useQuery,
    useMutation,
  };
}
