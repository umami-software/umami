import firstBy from 'thenby';
import { BROWSERS, ISO_COUNTRIES, DEVICES } from './constants';
import { removeTrailingSlash } from './format';

export const urlFilter = (data, { domain, raw }) => {
  const isValidUrl = url => {
    return url !== '' && !url.startsWith('#');
  };

  if (raw) {
    return data.filter(({ x }) => isValidUrl(x));
  }

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

export const refFilter = (data, { domain, domainOnly, raw }) => {
  const regex = new RegExp(domain.startsWith('http') ? domain : `http[s]?://${domain}`);

  const isValidRef = ref => {
    return ref !== '' && !ref.startsWith('/') && !ref.startsWith('#');
  };

  if (raw) {
    return data.filter(({ x }) => isValidRef(x) && !regex.test(x));
  }

  const cleanUrl = url => {
    try {
      const { hostname, origin, pathname, searchParams, protocol } = new URL(url);

      if (hostname === domain || regex.test(url)) {
        return null;
      }

      if (domainOnly && hostname) {
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

export const browserFilter = data =>
  data.map(({ x, y }) => ({ x: BROWSERS[x], y })).filter(({ x }) => x);

export const osFilter = data => data.filter(({ x }) => x);

export const deviceFilter = data =>
  data.map(({ x, y }) => ({ x: DEVICES[x], y })).filter(({ x }) => x);

export const countryFilter = data =>
  data.map(({ x, y }) => ({ x: ISO_COUNTRIES[x], y })).filter(({ x }) => x);

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y, ...props }) => ({ x, y, z: total ? (y / total) * 100 : 0, ...props }));
};
