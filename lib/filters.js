import { BROWSERS } from './constants';
import { removeTrailingSlash, removeWWW, getDomainName } from './url';

export const urlFilter = (data, { raw }) => {
  const isValidUrl = url => {
    return url !== '' && !url.startsWith('#');
  };

  if (raw) {
    return data.filter(({ x }) => isValidUrl(x));
  }

  const cleanUrl = url => {
    try {
      const { pathname, search } = new URL(url, location.origin);

      if (search.startsWith('?/')) {
        return `${pathname}${search}`;
      }

      return removeTrailingSlash(pathname);
    } catch {
      return null;
    }
  };

  const map = data.reduce((obj, { x, y }) => {
    if (!isValidUrl(x)) {
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

  return Object.keys(map).map(key => ({ x: key, y: map[key] }));
};

export const refFilter = (data, { domain, domainOnly, raw }) => {
  const domainName = getDomainName(domain);
  const regex = new RegExp(`http[s]?://${domainName}`);
  const links = {};

  const isValidRef = ref => {
    return ref !== '' && !ref.startsWith('/') && !ref.startsWith('#');
  };

  if (raw) {
    return data.filter(({ x }) => isValidRef(x) && !regex.test(x));
  }

  const cleanUrl = url => {
    try {
      const { hostname, origin, pathname, searchParams, protocol } = new URL(url);

      if (hostname === domainName) {
        return null;
      }

      if (domainOnly && hostname) {
        return removeWWW(hostname);
      }

      if (!origin || origin === 'null') {
        return `${protocol}${removeTrailingSlash(pathname)}`;
      }

      if (protocol.startsWith('http')) {
        const path = removeTrailingSlash(pathname);
        const ref = searchParams.get('ref');
        const query = ref ? `?ref=${ref}` : '';

        return removeTrailingSlash(`${removeWWW(hostname)}${path}`) + query;
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

    if (!domainOnly && !raw) {
      links[url] = x;
    }

    if (url) {
      if (!obj[url]) {
        obj[url] = y;
      } else {
        obj[url] += y;
      }
    }

    return obj;
  }, {});

  return Object.keys(map).map(key => ({ x: key, y: map[key], w: links[key] }));
};

export const browserFilter = data => data.map(({ x, y }) => ({ x: BROWSERS[x] ?? x, y }));

export const eventTypeFilter = (data, types) => {
  if (!types || types.length === 0) {
    return data;
  }

  return data.filter(({ x }) => {
    const [event] = x.split('\t');
    return types.some(type => type === event);
  });
};

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y, ...props }) => ({ x, y, z: total ? (y / total) * 100 : 0, ...props }));
};
