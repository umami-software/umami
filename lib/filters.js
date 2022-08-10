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

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y, ...props }) => ({ x, y, z: total ? (y / total) * 100 : 0, ...props }));
};

export const paramFilter = data => {
  const map = data.reduce((obj, { x, y }) => {
    try {
      const searchParams = new URLSearchParams(x.split('?')[1]);

      for (const [key, value] of searchParams) {
        if (!obj[key]) {
          obj[key] = { [value]: y };
        } else if (!obj[key][value]) {
          obj[key][value] = y;
        } else {
          obj[key][value] += y;
        }
      }
    } catch {
      // Ignore
    }

    return obj;
  }, {});

  const d = Object.keys(map).flatMap(key =>
    Object.keys(map[key]).map(n => ({ x: `${key}=${n}`, p: key, v: n, y: map[key][n] })),
  );

  console.log({ map, d });

  return d;
};
