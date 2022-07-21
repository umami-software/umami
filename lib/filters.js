import { removeWWW } from './url';

export const urlFilter = data => {
  const isValidUrl = url => {
    return url !== '' && url !== null && !url.startsWith('#');
  };

  const cleanUrl = url => {
    try {
      const { pathname, search } = new URL(url, location.origin);

      if (search.startsWith('?/')) {
        return `${pathname}${search}`;
      }

      return pathname;
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

export const refFilter = data => {
  const links = {};

  const map = data.reduce((obj, { x, y }) => {
    let id;

    try {
      const url = new URL(x);

      id = removeWWW(url.hostname) || url.href;
    } catch {
      id = '';
    }

    links[id] = x;

    if (!obj[id]) {
      obj[id] = y;
    } else {
      obj[id] += y;
    }

    return obj;
  }, {});

  return Object.keys(map).map(key => ({ x: key, y: map[key], w: links[key] }));
};

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
