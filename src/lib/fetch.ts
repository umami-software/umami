import { buildUrl } from 'lib/url';

export async function request(method: string, url: string, body?: string, headers: object = {}) {
  const res = await fetch(url, {
    method,
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
  return res.json();
}

export function httpGet(url: string, params: object = {}, headers: object = {}) {
  return request('GET', buildUrl(url, params), undefined, headers);
}

export function httpDelete(url: string, params: object = {}, headers: object = {}) {
  return request('DELETE', buildUrl(url, params), undefined, headers);
}

export function httpPost(url: string, params: object = {}, headers: object = {}) {
  return request('POST', url, JSON.stringify(params), headers);
}

export function httpPut(url: string, params: object = {}, headers: object = {}) {
  return request('PUT', url, JSON.stringify(params), headers);
}
