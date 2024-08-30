import type { FormatNumberOptions, IntlShape } from 'react-intl';

export function parseTime(val: number) {
  const days = ~~(val / 86400);
  const hours = ~~(val / 3600) - days * 24;
  const minutes = ~~(val / 60) - days * 1440 - hours * 60;
  const seconds = ~~val - days * 86400 - hours * 3600 - minutes * 60;
  const ms = (val - ~~val) * 1000;

  return {
    days,
    hours,
    minutes,
    seconds,
    ms,
  };
}

export function formatTime(val: number) {
  const { hours, minutes, seconds } = parseTime(val);
  const h = hours > 0 ? `${hours}:` : '';
  const m = hours > 0 ? minutes.toString().padStart(2, '0') : minutes;
  const s = seconds.toString().padStart(2, '0');

  return `${h}${m}:${s}`;
}

export function formatShortTime(intl: IntlShape, val: number, formats = ['m', 's']) {
  const { days, hours, minutes, seconds, ms } = parseTime(val);
  let t = '';

  if (days > 0 && formats.indexOf('d') !== -1) t += `${intl.formatNumber(days)}d `;
  if (hours > 0 && formats.indexOf('h') !== -1) t += `${intl.formatNumber(hours)}h `;
  if (minutes > 0 && formats.indexOf('m') !== -1) t += `${intl.formatNumber(minutes)}m `;
  if (seconds > 0 && formats.indexOf('s') !== -1) t += `${intl.formatNumber(seconds)}s `;
  if (ms > 0 && formats.indexOf('ms') !== -1) t += `${intl.formatNumber(ms)}ms`;

  if (!t) {
    return `0${formats[formats.length - 1]}`;
  }

  return t;
}

export function formatNumber(n: string | number) {
  return Number(n).toFixed(0);
}

export function formatLongNumberOptions(value: number): FormatNumberOptions {
  return value < 100
    ? {
        notation: 'compact',
        maximumFractionDigits: 0,
      }
    : {
        notation: 'compact',
        maximumSignificantDigits: 3,
      };
}

export function stringToColor(str: string) {
  if (!str) {
    return '#ffffff';
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}
