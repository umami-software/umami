import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getApiUrl } from '@/lib/api-url';
import { getClientAuthToken } from '@/lib/client';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from '@/lib/constants';
import { type FetchResponse, httpDelete, httpGet, httpPost, httpPut } from '@/lib/fetch';
import { useApp } from '@/store/app';

async function handleResponse(res: FetchResponse): Promise<any> {
  if (!res.ok) {
    const { message, code, status } = res?.data?.error || {};

    return Promise.reject(Object.assign(new Error(message), { code, status }));
  }
  return Promise.resolve(res.data);
}

export function useApi() {
  const shareId = useApp(state => state.share?.shareId);
  const shareToken = useApp(state => state.shareToken?.token);

  const shareHeaders =
    shareId && shareToken
      ? { [SHARE_TOKEN_HEADER]: shareToken, [SHARE_CONTEXT_HEADER]: '1' }
      : {};

  const defaultHeaders = {
    authorization: `Bearer ${getClientAuthToken()}`,
    ...shareHeaders,
  };
  const getUrl = (url: string) => {
    return getApiUrl(url);
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
