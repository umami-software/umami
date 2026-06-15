import { buildPath } from '@/lib/url';
import { getApiUrl } from './api-url';
import { getClientRefreshToken, setClientAuthToken, setClientRefreshToken } from './client';

export interface ErrorResponse {
  error: {
    status: number;
    message: string;
    code?: string;
  };
}

export interface FetchResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: ErrorResponse;
}

export async function request(
  method: string,
  url: string,
  body?: string,
  headers: object = {},
  skipRefresh: boolean = false
): Promise<FetchResponse> {
  return fetch(url, {
    method,
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  }).then(async res => {
    const data = await res.json();

    if (!skipRefresh && res.status === 401 && data?.error?.code === 'expired-token') {
      const token = await refreshTokens();
      return request(method, url, body, {
        ...headers,
        authorization: `Bearer ${token}`
      });
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  });
}

export async function refreshTokens() {
  const res = await request('POST', getApiUrl('/auth/refresh'), JSON.stringify({
    refreshToken: getClientRefreshToken(),
  }), { 'Content-Type' : 'application/json' }, true);

  if (res.data?.refreshToken) {
    setClientRefreshToken(res.data.refreshToken);
  }

  if (res.data?.token) {
    setClientAuthToken(res.data.token);
    return res.data.token;
  }

  throw new Error('Failed token refresh');
}

export async function httpGet(path: string, params: object = {}, headers: object = {}) {
  return request('GET', buildPath(path, params), undefined, headers);
}

export async function httpDelete(path: string, params: object = {}, headers: object = {}) {
  return request('DELETE', buildPath(path, params), undefined, headers);
}

export async function httpPost(path: string, params: object = {}, headers: object = {}) {
  return request('POST', path, JSON.stringify(params), headers);
}

export async function httpPut(path: string, params: object = {}, headers: object = {}) {
  return request('PUT', path, JSON.stringify(params), headers);
}
