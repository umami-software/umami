import { makeUrl } from './url';

export const apiRequest = (method, url, body, headers) => {
  return fetch(url, {
    method,
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  }).then(res => {
    if (res.ok) {
      return res.json().then(data => ({ ok: res.ok, status: res.status, data }));
    }

    return res.text().then(data => ({ ok: res.ok, status: res.status, res: res, data }));
  });
};

export const get = (url, params, headers) =>
  apiRequest('get', makeUrl(url, params), undefined, headers);

export const del = (url, params, headers) =>
  apiRequest('delete', makeUrl(url, params), undefined, headers);

export const post = (url, params, headers) =>
  apiRequest('post', url, JSON.stringify(params), headers);

export const put = (url, params, headers) =>
  apiRequest('put', url, JSON.stringify(params), headers);

export const hook = (_this, method, callback) => {
  const orig = _this[method];

  return (...args) => {
    callback.apply(null, args);

    return orig.apply(_this, args);
  };
};

export const doNotTrack = () => {
  const { doNotTrack, navigator, external } = window;

  const msTrackProtection = 'msTrackingProtectionEnabled';
  const msTracking = () => {
    return external && msTrackProtection in external && external[msTrackProtection]();
  };

  const dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking();

  return dnt == '1' || dnt === 'yes';
};

export const setItem = (key, data, session) => {
  if (typeof window !== 'undefined' && data) {
    (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(data));
  }
};

export const getItem = (key, session) => {
  if (typeof window !== 'undefined') {
    const value = (session ? sessionStorage : localStorage).getItem(key);

    if (value !== 'undefined') {
      return JSON.parse(value);
    }
  }
};

export const removeItem = (key, session) => {
  if (typeof window !== 'undefined') {
    (session ? sessionStorage : localStorage).removeItem(key);
  }
};
