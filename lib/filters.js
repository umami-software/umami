import firstBy from 'thenby';
import { BROWSERS, ISO_COUNTRIES, DEVICES } from './constants';
import { removeTrailingSlash } from './format';

export const browserFilter = data =>
  data.map(({ x, ...props }) => ({ x: BROWSERS[x] || x, ...props }));

export const urlFilter = (data, { domain }) => {
  const isValidUrl = url => {
    return url !== '' && !url.startsWith('#');
  };

  const cleanUrl = url => {
    try {
      const { pathname, searchParams } = new URL(url);

      const path = removeTrailingSlash(pathname);
      const ref = searchParams.get('ref');
      const query = ref ? `?ref=${ref}` : '';

      return `${path}${query}`;
    } catch {
      return null;
    }
  };

  const map = data.reduce((obj, { x, y }) => {
    if (!isValidUrl(x)) {
      return obj;
    }

    const url = cleanUrl(x.startsWith('/') ? `http://${domain}${x}` : x);

    if (url) {
      if (!obj[url]) {
        obj[url] = y;
      } else {
        obj[url] += y;
      }
    }

    return obj;
  }, {});

  return Object.keys(map)
    .map(key => ({ x: key, y: map[key] }))
    .sort(firstBy('y', -1).thenBy('x'));
};

export const refFilter = (data, { domain, domainsOnly }) => {
  const isValidRef = ref => {
    return ref !== '' && !ref.startsWith('/') && !ref.startsWith('#');
  };

  const cleanUrl = url => {
    try {
      const { hostname, origin, pathname, searchParams, protocol } = new URL(url);

      if (hostname === domain) {
        return null;
      }

      if (domainsOnly && hostname) {
        return hostname;
      }

      if (!origin || origin === 'null') {
        return `${protocol}${removeTrailingSlash(pathname)}`;
      }

      if (protocol.startsWith('http')) {
        const path = removeTrailingSlash(pathname);
        const ref = searchParams.get('ref');
        const query = ref ? `?ref=${ref}` : '';

        return `${origin}${path}${query}`;
      }

      return null;
    } catch {
      return null;
    }
  };

  const map = data.reduce((obj, { x, y }) => {
    if (!isValidRef(x)) {
      return obj;
    }

    const url = cleanUrl(x);

    if (url) {
      if (!obj[url]) {
        obj[url] = y;
      } else {
        obj[url] += y;
      }
    }

    return obj;
  }, {});

  return Object.keys(map)
    .map(key => ({ x: key, y: map[key] }))
    .sort(firstBy('y', -1).thenBy('x'));
};

export const deviceFilter = data =>
  data.map(({ x, ...props }) => ({ x: DEVICES[x] || x, ...props }));

export const countryFilter = data =>
  data.map(({ x, ...props }) => ({ x: ISO_COUNTRIES[x] || x, ...props }));

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y }) => ({ x, y, z: total ? (y / total) * 100 : 0 }));
};
