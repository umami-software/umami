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

export function formatShortTime(val: number, formats = ['m', 's'], space = '') {
  const { days, hours, minutes, seconds, ms } = parseTime(val);
  let t = '';

  if (days > 0 && formats.indexOf('d') !== -1) t += `${days}d${space}`;
  if (hours > 0 && formats.indexOf('h') !== -1) t += `${hours}h${space}`;
  if (minutes > 0 && formats.indexOf('m') !== -1) t += `${minutes}m${space}`;
  if (seconds > 0 && formats.indexOf('s') !== -1) t += `${seconds}s${space}`;
  if (ms > 0 && formats.indexOf('ms') !== -1) t += `${ms}ms`;

  if (!t) {
    return `0${formats[formats.length - 1]}`;
  }

  return t;
}

export function formatNumber(n: string | number) {
  return Number(n).toFixed(0);
}

export function formatLongNumber(value: number) {
  const n = Number(value);

  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}m`;
  }
  if (n >= 100000) {
    return `${(n / 1000).toFixed(0)}k`;
  }
  if (n >= 10000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(2)}k`;
  }

  return formatNumber(n);
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
