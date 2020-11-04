export const AUTH_COOKIE_NAME = 'umami.auth';
export const LOCALE_CONFIG = 'umami.locale';
export const TIMEZONE_CONFIG = 'umami.timezone';
export const DATE_RANGE_CONFIG = 'umami.date-range';
export const THEME_CONFIG = 'umami.theme';
export const VERSION_CHECK = 'umami.version-check';
export const TOKEN_HEADER = 'x-umami-token';

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_THEME = 'light';
export const DEFAUL_CHART_HEIGHT = 400;
export const DEFAULT_ANIMATION_DURATION = 300;
export const DEFAULT_DATE_RANGE = '24hour';

export const REALTIME_RANGE = 30;
export const REALTIME_INTERVAL = 3000;

export const THEME_COLORS = {
  light: {
    primary: '#2680eb',
    gray50: '#ffffff',
    gray75: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#eaeaea',
    gray300: '#e1e1e1',
    gray400: '#cacaca',
    gray500: '#b3b3b3',
    gray600: '#8e8e8e',
    gray700: '#6e6e6e',
    gray800: '#4b4b4b',
    gray900: '#2c2c2c',
  },
  dark: {
    primary: '#2680eb',
    gray50: '#252525',
    gray75: '#2f2f2f',
    gray100: '#323232',
    gray200: '#3e3e3e',
    gray300: '#4a4a4a',
    gray400: '#5a5a5a',
    gray500: '#6e6e6e',
    gray600: '#909090',
    gray700: '#b9b9b9',
    gray800: '#e3e3e3',
    gray900: '#ffffff',
  },
};

export const EVENT_COLORS = [
  '#2680eb',
  '#9256d9',
  '#44b556',
  '#e68619',
  '#e34850',
  '#f7bd12',
  '#01bad7',
  '#6734bc',
  '#89c541',
  '#ffc301',
  '#ec1562',
  '#ffec16',
];

export const POSTGRESQL = 'postgresql';
export const MYSQL = 'mysql';

export const MYSQL_DATE_FORMATS = {
  minute: '%Y-%m-%d %H:%i:00',
  hour: '%Y-%m-%d %H:00:00',
  day: '%Y-%m-%d',
  month: '%Y-%m-01',
  year: '%Y-01-01',
};

export const POSTGRESQL_DATE_FORMATS = {
  minute: 'YYYY-MM-DD HH24:MI:00',
  hour: 'YYYY-MM-DD HH24:00:00',
  day: 'YYYY-MM-DD',
  month: 'YYYY-MM-01',
  year: 'YYYY-01-01',
};

export const DOMAIN_REGEX = /localhost(:\d{1,5})?|((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}/;

export const DESKTOP_SCREEN_WIDTH = 1920;
export const LAPTOP_SCREEN_WIDTH = 1024;
export const MOBILE_SCREEN_WIDTH = 479;

export const DESKTOP_OS = [
  'Windows 3.11',
  'Windows 95',
  'Windows 98',
  'Windows 2000',
  'Windows XP',
  'Windows Server 2003',
  'Windows Vista',
  'Windows 7',
  'Windows 8',
  'Windows 8.1',
  'Windows 10',
  'Windows ME',
  'Open BSD',
  'Sun OS',
  'Linux',
  'Mac OS',
  'QNX',
  'BeOS',
  'OS/2',
  'Chrome OS',
];

export const MOBILE_OS = ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile', 'Amazon OS'];

export const BROWSERS = {
  aol: 'AOL',
  edge: 'Edge',
  'edge-ios': 'Edge (iOS)',
  yandexbrowser: 'Yandex',
  kakaotalk: 'KKaoTalk',
  samsung: 'Samsung',
  silk: 'Silk',
  miui: 'MIUI',
  beaker: 'Beaker',
  'edge-chromium': 'Edge (Chromium)',
  chrome: 'Chrome',
  'chromium-webview': 'Chrome (webview)',
  phantomjs: 'PhantomJS',
  crios: 'Chrome (iOS)',
  firefox: 'Firefox',
  fxios: 'Firefox (iOS)',
  'opera-mini': 'Opera Mini',
  opera: 'Opera',
  ie: 'IE',
  bb10: 'BlackBerry 10',
  android: 'Android',
  ios: 'iOS',
  safari: 'Safari',
  facebook: 'Facebook',
  instagram: 'Instagram',
  'ios-webview': 'iOS (webview)',
  searchbot: 'Searchbot',
};
