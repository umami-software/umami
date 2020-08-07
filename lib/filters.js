import { BROWSERS, ISO_COUNTRIES } from './constants';

export const browserFilter = data =>
  data.map(({ x, ...props }) => ({ x: BROWSERS[x] || x, ...props }));

export const urlFilter = data => data.filter(({ x }) => x !== '' && !x.startsWith('#'));

export const refFilter = data =>
  data.filter(({ x }) => x !== '' && !x.startsWith('/') && !x.startsWith('#'));

export const deviceFilter = data => {
  if (data.length === 0) return [];

  const devices = data.reduce(
    (obj, { x, y }) => {
      const [width] = x.split('x');
      if (width >= 1920) {
        obj.Desktop += +y;
      } else if (width >= 1024) {
        obj.Laptop += +y;
      } else if (width >= 767) {
        obj.Tablet += +y;
      } else {
        obj.Mobile += +y;
      }
      return obj;
    },
    { Desktop: 0, Laptop: 0, Tablet: 0, Mobile: 0 },
  );

  return percentFilter(Object.keys(devices).map(key => ({ x: key, y: devices[key] })));
};

export const countryFilter = data =>
  data.map(({ x, ...props }) => ({ x: ISO_COUNTRIES[x] || x, ...props }));

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y }) => ({ x, y, z: total ? (y / total) * 100 : 0 }));
};
