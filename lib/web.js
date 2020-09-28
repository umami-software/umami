import { getQueryString } from './url';

export const apiRequest = (method, url, body) =>
  fetch(url, {
    method,
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }).then(res => {
    if (res.ok) {
      return res.json();
    }

    if (['post', 'put', 'delete'].includes(method)) {
      return res.text();
    }

    return null;
  });

export const get = (url, params) => apiRequest('get', `${url}${getQueryString(params)}`);

export const del = (url, params) => apiRequest('delete', `${url}${getQueryString(params)}`);

export const post = (url, params) => apiRequest('post', url, JSON.stringify(params));

export const put = (url, params) => apiRequest('put', url, JSON.stringify(params));

export const hook = (_this, method, callback) => {
  const orig = _this[method];

  return (...args) => {
    callback.apply(null, args);

    return orig.apply(_this, args);
  };
};

export const doNotTrack = () => {
  const { doNotTrack, navigator, external } = window;

  const msTracking = () => {
    return (
      external &&
      typeof external.msTrackingProtectionEnabled === 'function' &&
      external.msTrackingProtectionEnabled()
    );
  };

  const dnt = doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack || msTracking();

  return dnt === true || dnt === 1 || dnt === 'yes' || dnt === '1';
};

export const setItem = (key, data, session) => {
  if (typeof window !== 'undefined') {
    (session ? sessionStorage : localStorage).setItem(key, JSON.stringify(data));
  }
};

export const getItem = (key, session) =>
  typeof window !== 'undefined'
    ? JSON.parse((session ? sessionStorage : localStorage).getItem(key))
    : null;
