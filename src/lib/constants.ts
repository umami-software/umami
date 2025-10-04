export const CURRENT_VERSION = process.env.currentVersion;
export const AUTH_TOKEN = 'umami.auth';
export const LOCALE_CONFIG = 'umami.locale';
export const TIMEZONE_CONFIG = 'umami.timezone';
export const DATE_RANGE_CONFIG = 'umami.date-range';
export const THEME_CONFIG = 'umami.theme';
export const DASHBOARD_CONFIG = 'umami.dashboard';
export const VERSION_CHECK = 'umami.version-check';
export const SHARE_TOKEN_HEADER = 'x-umami-share-token';
export const HOMEPAGE_URL = 'https://umami.is';
export const REPO_URL = 'https://github.com/umami-software/umami';
export const UPDATES_URL = 'https://api.umami.is/v1/updates';
export const TELEMETRY_PIXEL = 'https://i.umami.is/a.png';
export const FAVICON_URL = 'https://icons.duckduckgo.com/ip3/{{domain}}.ico';

export const DEFAULT_LOCALE = 'en-US';
export const DEFAULT_THEME = 'light';
export const DEFAULT_ANIMATION_DURATION = 300;
export const DEFAULT_DATE_RANGE = '24hour';
export const DEFAULT_WEBSITE_LIMIT = 10;
export const DEFAULT_RESET_DATE = '2000-01-01';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_DATE_COMPARE = 'prev';

export const REALTIME_RANGE = 30;
export const REALTIME_INTERVAL = 10000;

export const FILTER_COMBINED = 'filter-combined';
export const FILTER_RAW = 'filter-raw';
export const FILTER_DAY = 'filter-day';
export const FILTER_RANGE = 'filter-range';
export const FILTER_REFERRERS = 'filter-referrers';
export const FILTER_PAGES = 'filter-pages';

export const UNIT_TYPES = ['year', 'month', 'hour', 'day', 'minute'];
export const EVENT_COLUMNS = [
  'url',
  'entry',
  'exit',
  'referrer',
  'title',
  'query',
  'event',
  'tag',
  'host',
];

export const SESSION_COLUMNS = [
  'browser',
  'os',
  'device',
  'screen',
  'language',
  'country',
  'city',
  'region',
];

export const FILTER_GROUPS = {
  segment: 'segment',
  cohort: 'cohort',
};

export const FILTER_COLUMNS = {
  url: 'url_path',
  entry: 'url_path',
  exit: 'url_path',
  referrer: 'referrer_domain',
  host: 'hostname',
  title: 'page_title',
  query: 'url_query',
  os: 'os',
  browser: 'browser',
  device: 'device',
  country: 'country',
  region: 'region',
  city: 'city',
  language: 'language',
  event: 'event_name',
  tag: 'tag',
};

export const COLLECTION_TYPE = {
  event: 'event',
  identify: 'identify',
};

export const EVENT_TYPE = {
  pageView: 1,
  customEvent: 2,
} as const;

export const DATA_TYPE = {
  string: 1,
  number: 2,
  boolean: 3,
  date: 4,
  array: 5,
} as const;

export const OPERATORS = {
  equals: 'eq',
  notEquals: 'neq',
  set: 's',
  notSet: 'ns',
  contains: 'c',
  doesNotContain: 'dnc',
  true: 't',
  false: 'f',
  greaterThan: 'gt',
  lessThan: 'lt',
  greaterThanEquals: 'gte',
  lessThanEquals: 'lte',
  before: 'bf',
  after: 'af',
} as const;

export const OPERATOR_PREFIXES = {
  [OPERATORS.equals]: '',
  [OPERATORS.notEquals]: '!',
  [OPERATORS.contains]: '~',
  [OPERATORS.doesNotContain]: '!~',
};

export const DATA_TYPES = {
  [DATA_TYPE.string]: 'string',
  [DATA_TYPE.number]: 'number',
  [DATA_TYPE.boolean]: 'boolean',
  [DATA_TYPE.date]: 'date',
  [DATA_TYPE.array]: 'array',
};

export const REPORT_TYPES = {
  funnel: 'funnel',
  goals: 'goals',
  insights: 'insights',
  retention: 'retention',
  utm: 'utm',
  journey: 'journey',
  revenue: 'revenue',
  attribution: 'attribution',
} as const;

export const REPORT_PARAMETERS = {
  fields: 'fields',
  filters: 'filters',
  groups: 'groups',
} as const;

export const KAFKA_TOPIC = {
  event: 'event',
  eventData: 'event_data',
} as const;

export const ROLES = {
  admin: 'admin',
  teamManager: 'team-manager',
  teamMember: 'team-member',
  teamOwner: 'team-owner',
  teamViewOnly: 'team-view-only',
  user: 'user',
  viewOnly: 'view-only',
} as const;

export const PERMISSIONS = {
  all: 'all',
  websiteCreate: 'website:create',
  websiteUpdate: 'website:update',
  websiteDelete: 'website:delete',
  websiteTransferToTeam: 'website:transfer-to-team',
  websiteTransferToUser: 'website:transfer-to-user',
  teamCreate: 'team:create',
  teamUpdate: 'team:update',
  teamDelete: 'team:delete',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.admin]: [PERMISSIONS.all],
  [ROLES.user]: [
    PERMISSIONS.websiteCreate,
    PERMISSIONS.websiteUpdate,
    PERMISSIONS.websiteDelete,
    PERMISSIONS.teamCreate,
  ],
  [ROLES.viewOnly]: [],
  [ROLES.teamOwner]: [
    PERMISSIONS.teamUpdate,
    PERMISSIONS.teamDelete,
    PERMISSIONS.websiteCreate,
    PERMISSIONS.websiteUpdate,
    PERMISSIONS.websiteDelete,
    PERMISSIONS.websiteTransferToTeam,
    PERMISSIONS.websiteTransferToUser,
  ],
  [ROLES.teamManager]: [
    PERMISSIONS.teamUpdate,
    PERMISSIONS.websiteCreate,
    PERMISSIONS.websiteUpdate,
    PERMISSIONS.websiteDelete,
    PERMISSIONS.websiteTransferToTeam,
  ],
  [ROLES.teamMember]: [
    PERMISSIONS.websiteCreate,
    PERMISSIONS.websiteUpdate,
    PERMISSIONS.websiteDelete,
  ],
  [ROLES.teamViewOnly]: [],
} as const;

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

export const CHART_COLORS = [
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

export const DOMAIN_REGEX =
  /^(localhost(:[1-9]\d{0,4})?|((?=[a-z0-9-_]{1,63}\.)(xn--)?[a-z0-9-_]+(-[a-z0-9-_]+)*\.)+(xn--)?[a-z0-9-_]{2,63})$/;
export const SHARE_ID_REGEX = /^[a-zA-Z0-9]{8,16}$/;
export const DATETIME_REGEX =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3}(Z|\+[0-9]{2}:[0-9]{2})?)?$/;

export const DESKTOP_SCREEN_WIDTH = 1920;
export const LAPTOP_SCREEN_WIDTH = 1024;
export const MOBILE_SCREEN_WIDTH = 479;

export const URL_LENGTH = 500;
export const PAGE_TITLE_LENGTH = 500;
export const EVENT_NAME_LENGTH = 50;

export const UTM_PARAMS = ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'];

export const DESKTOP_OS = [
  'BeOS',
  'Chrome OS',
  'Linux',
  'Mac OS',
  'Open BSD',
  'OS/2',
  'QNX',
  'Sun OS',
  'Windows 10',
  'Windows 2000',
  'Windows 3.11',
  'Windows 7',
  'Windows 8',
  'Windows 8.1',
  'Windows 95',
  'Windows 98',
  'Windows ME',
  'Windows Server 2003',
  'Windows Vista',
  'Windows XP',
];

export const MOBILE_OS = ['Amazon OS', 'Android OS', 'BlackBerry OS', 'iOS', 'Windows Mobile'];

export const OS_NAMES = {
  'Android OS': 'Android',
  'Chrome OS': 'ChromeOS',
  'Mac OS': 'macOS',
  'Sun OS': 'SunOS',
  'Windows 10': 'Windows 10/11',
};

export const BROWSERS = {
  android: 'Android',
  aol: 'AOL',
  bb10: 'BlackBerry 10',
  beaker: 'Beaker',
  chrome: 'Chrome',
  'chromium-webview': 'Chrome (webview)',
  crios: 'Chrome (iOS)',
  curl: 'Curl',
  edge: 'Edge',
  'edge-chromium': 'Edge (Chromium)',
  'edge-ios': 'Edge (iOS)',
  facebook: 'Facebook',
  firefox: 'Firefox',
  fxios: 'Firefox (iOS)',
  ie: 'IE',
  instagram: 'Instagram',
  ios: 'iOS',
  'ios-webview': 'iOS (webview)',
  kakaotalk: 'KakaoTalk',
  miui: 'MIUI',
  opera: 'Opera',
  'opera-mini': 'Opera Mini',
  phantomjs: 'PhantomJS',
  safari: 'Safari',
  samsung: 'Samsung',
  searchbot: 'Searchbot',
  silk: 'Silk',
  yandexbrowser: 'Yandex',
};

// The order here is important and influences how IPs are detected by lib/detect.ts
// Please do not change the order unless you know exactly what you're doing - read https://developers.cloudflare.com/fundamentals/reference/http-headers/
export const IP_ADDRESS_HEADERS = [
  'x-client-ip',
  'x-forwarded-for',
  'cf-connecting-ip', // This should be *after* x-forwarded-for, so that x-forwarded-for is respected if present
  'do-connecting-ip',
  'fastly-client-ip',
  'true-client-ip',
  'x-real-ip',
  'x-cluster-client-ip',
  'x-forwarded',
  'forwarded',
  'x-appengine-user-ip',
  'x-nf-client-connection-ip',
  'x-real-ip',
];

export const SOCIAL_DOMAINS = [
  'bsky.app',
  'facebook.com',
  'fb.com',
  'ig.com',
  'instagram.com',
  'linkedin.',
  'news.ycombinator.com',
  'pinterest.',
  'reddit.',
  'snapchat.',
  't.co',
  'threads.net',
  'tiktok.',
  'twitter.com',
  'x.com',
];

export const SEARCH_DOMAINS = [
  'baidu.com',
  'bing.com',
  'chatgpt.com',
  'duckduckgo.com',
  'ecosia.org',
  'google.',
  'msn.com',
  'perplexity.ai',
  'search.brave.com',
  'yandex.',
];

export const SHOPPING_DOMAINS = [
  'alibaba.com',
  'aliexpress.com',
  'amazon.',
  'bestbuy.com',
  'ebay.com',
  'etsy.com',
  'newegg.com',
  'target.com',
  'walmart.com',
];

export const EMAIL_DOMAINS = [
  'gmail.',
  'hotmail.',
  'mail.yahoo.',
  'outlook.',
  'proton.me',
  'protonmail.',
];

export const VIDEO_DOMAINS = ['twitch.', 'youtube.'];

export const PAID_AD_PARAMS = [
  'ad_id=',
  'aid=',
  'dclid=',
  'epik=',
  'fbclid=',
  'gclid=',
  'li_fat_id=',
  'msclkid=',
  'ob_click_id=',
  'pc_id=',
  'rdt_cid=',
  'scid=',
  'ttclid=',
  'twclid=',
  'utm_medium=cpc',
  'utm_medium=paid',
  'utm_medium=paid_social',
  'utm_source=google',
];

export const GROUPED_DOMAINS = [
  { name: 'Bing', domain: 'bing.com', match: 'bing.' },
  { name: 'Brave', domain: 'brave.com', match: 'brave.' },
  { name: 'ChatGPT', domain: 'chatgpt.com', match: 'chatgpt.' },
  { name: 'DuckDuckGo', domain: 'duckduckgo.com', match: 'duckduckgo.' },
  { name: 'Facebook', domain: 'facebook.com', match: 'facebook.' },
  { name: 'GitHub', domain: 'github.com', match: 'github.' },
  { name: 'Google', domain: 'google.com', match: 'google.' },
  { name: 'Hacker News', domain: 'news.ycombinator.com', match: 'news.ycombinator.com' },
  { name: 'Instagram', domain: 'instagram.com', match: ['instagram.', 'ig.com'] },
  { name: 'LinkedIn', domain: 'linkedin.com', match: 'linkedin.' },
  { name: 'Pinterest', domain: 'pinterest.com', match: 'pinterest.' },
  { name: 'Reddit', domain: 'reddit.com', match: 'reddit.' },
  { name: 'Snapchat', domain: 'snapchat.com', match: 'snapchat.' },
  { name: 'Twitter', domain: 'twitter.com', match: ['twitter.', 't.co', 'x.com'] },
];

export const MAP_FILE = '/datamaps.world.json';

export const ISO_COUNTRIES = {
  ABW: 'AW',
  AFG: 'AF',
  AGO: 'AO',
  AIA: 'AI',
  ALA: 'AX',
  ALB: 'AL',
  AND: 'AD',
  ANT: 'AN',
  ARE: 'AE',
  ARG: 'AR',
  ARM: 'AM',
  ASM: 'AS',
  ATF: 'TF',
  ATG: 'AG',
  AUS: 'AU',
  AUT: 'AT',
  AZE: 'AZ',
  BDI: 'BI',
  BEL: 'BE',
  BEN: 'BJ',
  BFA: 'BF',
  BGD: 'BD',
  BGR: 'BG',
  BHR: 'BH',
  BHS: 'BS',
  BIH: 'BA',
  BLR: 'BY',
  BLZ: 'BZ',
  BLM: 'BL',
  BMU: 'BM',
  BOL: 'BO',
  BRA: 'BR',
  BRB: 'BB',
  BRN: 'BN',
  BTN: 'BT',
  BVT: 'BV',
  BWA: 'BW',
  CAF: 'CF',
  CAN: 'CA',
  CCK: 'CC',
  CHE: 'CH',
  CHL: 'CL',
  CHN: 'CN',
  CIV: 'CI',
  CMR: 'CM',
  COD: 'CD',
  COG: 'CG',
  COK: 'CK',
  COL: 'CO',
  COM: 'KM',
  CPV: 'CV',
  CRI: 'CR',
  CUB: 'CU',
  CXR: 'CX',
  CYM: 'KY',
  CYP: 'CY',
  CZE: 'CZ',
  DEU: 'DE',
  DJI: 'DJ',
  DMA: 'DM',
  DNK: 'DK',
  DOM: 'DO',
  DZA: 'DZ',
  ECU: 'EC',
  EGY: 'EG',
  ERI: 'ER',
  ESH: 'EH',
  ESP: 'ES',
  EST: 'EE',
  ETH: 'ET',
  FIN: 'FI',
  FJI: 'FJ',
  FLK: 'FK',
  FRA: 'FR',
  FRO: 'FO',
  FSM: 'FM',
  GAB: 'GA',
  GBR: 'GB',
  GEO: 'GE',
  GGY: 'GG',
  GHA: 'GH',
  GIB: 'GI',
  GIN: 'GN',
  GLP: 'GP',
  GMB: 'GM',
  GNB: 'GW',
  GNQ: 'GQ',
  GRC: 'GR',
  GRD: 'GD',
  GRL: 'GL',
  GTM: 'GT',
  GUF: 'GF',
  GUM: 'GU',
  GUY: 'GY',
  HKG: 'HK',
  HMD: 'HM',
  HND: 'HN',
  HRV: 'HR',
  HTI: 'HT',
  HUN: 'HU',
  IDN: 'ID',
  IMN: 'IM',
  IND: 'IN',
  IOT: 'IO',
  IRL: 'IE',
  IRN: 'IR',
  IRQ: 'IQ',
  ISL: 'IS',
  ISR: 'IL',
  ITA: 'IT',
  JAM: 'JM',
  JEY: 'JE',
  JOR: 'JO',
  JPN: 'JP',
  KAZ: 'KZ',
  KEN: 'KE',
  KGZ: 'KG',
  KHM: 'KH',
  KIR: 'KI',
  KNA: 'KN',
  KOR: 'KR',
  KWT: 'KW',
  LAO: 'LA',
  LBN: 'LB',
  LBR: 'LR',
  LBY: 'LY',
  LCA: 'LC',
  LIE: 'LI',
  LKA: 'LK',
  LSO: 'LS',
  LTU: 'LT',
  LUX: 'LU',
  LVA: 'LV',
  MAF: 'MF',
  MAR: 'MA',
  MCO: 'MC',
  MDA: 'MD',
  MDG: 'MG',
  MDV: 'MV',
  MEX: 'MX',
  MHL: 'MH',
  MKD: 'MK',
  MLI: 'ML',
  MLT: 'MT',
  MMR: 'MM',
  MNE: 'ME',
  MNG: 'MN',
  MNP: 'MP',
  MOZ: 'MZ',
  MRT: 'MR',
  MSR: 'MS',
  MTQ: 'MQ',
  MUS: 'MU',
  MWI: 'MW',
  MYS: 'MY',
  MYT: 'YT',
  NAM: 'NA',
  NCL: 'NC',
  NER: 'NE',
  NFK: 'NF',
  NGA: 'NG',
  NIC: 'NI',
  NIU: 'NU',
  NLD: 'NL',
  NOR: 'NO',
  NPL: 'NP',
  NRU: 'NR',
  NZL: 'NZ',
  OMN: 'OM',
  PAK: 'PK',
  PAN: 'PA',
  PCN: 'PN',
  PER: 'PE',
  PHL: 'PH',
  PLW: 'PW',
  PNG: 'PG',
  POL: 'PL',
  PRI: 'PR',
  PRK: 'KP',
  PRT: 'PT',
  PRY: 'PY',
  PSE: 'PS',
  PYF: 'PF',
  QAT: 'QA',
  REU: 'RE',
  ROU: 'RO',
  RUS: 'RU',
  RWA: 'RW',
  SAU: 'SA',
  SDN: 'SD',
  SEN: 'SN',
  SGP: 'SG',
  SGS: 'GS',
  SHN: 'SH',
  SJM: 'SJ',
  SLB: 'SB',
  SLE: 'SL',
  SLV: 'SV',
  SMR: 'SM',
  SOM: 'SO',
  SPM: 'PM',
  SRB: 'RS',
  SUR: 'SR',
  STP: 'ST',
  SVK: 'SK',
  SVN: 'SI',
  SWE: 'SE',
  SWZ: 'SZ',
  SYC: 'SC',
  SYR: 'SY',
  TCA: 'TC',
  TCD: 'TD',
  TGO: 'TG',
  THA: 'TH',
  TJK: 'TJ',
  TKL: 'TK',
  TKM: 'TM',
  TLS: 'TL',
  TON: 'TO',
  TTO: 'TT',
  TUN: 'TN',
  TUR: 'TR',
  TUV: 'TV',
  TWN: 'TW',
  TZA: 'TZ',
  UGA: 'UG',
  UKR: 'UA',
  UMI: 'UM',
  URY: 'UY',
  USA: 'US',
  UZB: 'UZ',
  VAT: 'VA',
  VCT: 'VC',
  VEN: 'VE',
  VGB: 'VG',
  VIR: 'VI',
  VNM: 'VN',
  VUT: 'VU',
  WLF: 'WF',
  WSM: 'WS',
  XKX: 'XK',
  YEM: 'YE',
  ZAF: 'ZA',
  ZMB: 'ZM',
  ZWE: 'ZW',
};
