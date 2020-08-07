import escape from 'escape-string-regexp';
import { BROWSERS, ISO_COUNTRIES, DEVICES } from './constants';

export const browserFilter = data =>
  data.map(({ x, ...props }) => ({ x: BROWSERS[x] || x, ...props }));

export const urlFilter = data => data.filter(({ x }) => x !== '' && !x.startsWith('#'));

export const refFilter = domain => data => {
  const regex = new RegExp(escape(domain));
  return data.filter(
    ({ x }) => x !== '' && !x.startsWith('/') && !x.startsWith('#') && !regex.test(x),
  );
};

export const deviceFilter = data =>
  data.map(({ x, ...props }) => ({ x: DEVICES[x] || x, ...props }));

export const countryFilter = data =>
  data.map(({ x, ...props }) => ({ x: ISO_COUNTRIES[x] || x, ...props }));

export const percentFilter = data => {
  const total = data.reduce((n, { y }) => n + y, 0);
  return data.map(({ x, y }) => ({ x, y, z: total ? (y / total) * 100 : 0 }));
};
