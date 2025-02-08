import { buildUrl } from '@/lib/url';

export async function request(method: string, url: string, body?: string, headers: object = {}) {
  return fetch(url, {
    method,
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  }).then(res => res.json());
}

export async function httpGet(url: string, params: object = {}, headers: object = {}) {
  return request('GET', buildUrl(url, params), undefined, headers);
}

export async function httpDelete(url: string, params: object = {}, headers: object = {}) {
  return request('DELETE', buildUrl(url, params), undefined, headers);
}

export async function httpPost(url: string, params: object = {}, headers: object = {}) {
  return request('POST', url, JSON.stringify(params), headers);
}

export async function httpPut(url: string, params: object = {}, headers: object = {}) {
  return request('PUT', url, JSON.stringify(params), headers);
}
