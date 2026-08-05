import 'dotenv/config';
import createNextIntlPlugin from 'next-intl/plugin';
import pkg from './package.json' with { type: 'json' };
import { getContentSecurityPolicy } from './src/lib/csp';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const TRACKER_SCRIPT = '/script.js';
const RECORDER_SCRIPT = '/recorder.js';

const isProd = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL);

const apiUrl = process.env.API_URL || '';
const basePath = process.env.BASE_PATH || '';
const cloudMode = process.env.CLOUD_MODE || '';
const cloudUrl = process.env.CLOUD_URL || '';
const collectApiEndpoint = process.env.COLLECT_API_ENDPOINT || '';
const corsMaxAge = process.env.CORS_MAX_AGE || '';
const defaultCurrency = process.env.DEFAULT_CURRENCY || '';
const defaultLocale = process.env.DEFAULT_LOCALE || '';
const forceSSL = process.env.FORCE_SSL || '';
const trackerScriptName = process.env.TRACKER_SCRIPT_NAME || '';
const trackerScriptURL = process.env.TRACKER_SCRIPT_URL || '';
const selfTrack = process.env.UMAMI_SELF_TRACK || '';
const selfRecord = process.env.UMAMI_SELF_RECORD || '';

function isRelativeUrl(url: string) {
  return Boolean(url && !/^https?:\/\//i.test(url));
}

function normalizePath(url: string) {
  return `/${url.replace(/^\/+|\/+$/g, '')}`;
}

const defaultHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Content-Security-Policy',
    value: getContentSecurityPolicy(),
  },
];

if (forceSSL) {
  defaultHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const trackerHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Cache-Control',
    value: 'public, max-age=86400, must-revalidate',
  },
];

const apiHeaders = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, DELETE, POST, PUT',
  },
  {
    key: 'Access-Control-Max-Age',
    value: corsMaxAge || '86400',
  },
  {
    key: 'Cache-Control',
    value: 'no-cache',
  },
];

const headers = [
  {
    source: '/api/:path*',
    headers: apiHeaders,
  },
  {
    source: '/:path*',
    headers: defaultHeaders,
  },
];

if (isProd) {
  headers.push({
    source: TRACKER_SCRIPT,
    headers: trackerHeaders,
  });
  headers.push({
    source: RECORDER_SCRIPT,
    headers: trackerHeaders,
  });
}

const rewrites = [];

if (trackerScriptURL) {
  rewrites.push({
    source: TRACKER_SCRIPT,
    destination: trackerScriptURL,
  });
}

if (collectApiEndpoint) {
  headers.push({
    source: collectApiEndpoint,
    headers: apiHeaders,
  });

  rewrites.push({
    source: collectApiEndpoint,
    destination: '/api/send',
  });
}

if (isRelativeUrl(apiUrl)) {
  const normalizedApiUrl = normalizePath(apiUrl);

  if (normalizedApiUrl !== '/' && normalizedApiUrl !== '/api') {
    headers.push({
      source: `${normalizedApiUrl}/:path*`,
      headers: apiHeaders,
    });

    rewrites.push({
      source: `${normalizedApiUrl}/:path*`,
      destination: '/api/:path*',
    });
  }
}

const redirects = [
  {
    source: '/teams/:id/dashboard/edit',
    destination: '/dashboard/edit',
    permanent: false,
  },
  {
    source: '/teams/:id/dashboard',
    destination: '/dashboard',
    permanent: false,
  },
  {
    source: '/settings',
    destination: '/settings/preferences',
    permanent: false,
  },
  {
    source: '/teams/:id',
    destination: '/teams/:id/websites',
    permanent: false,
  },
  {
    source: '/teams/:id/settings',
    destination: '/teams/:id/settings/preferences',
    permanent: false,
  },
  {
    source: '/admin',
    destination: '/admin/users',
    permanent: false,
  },
];

// Adding rewrites + headers for all alternative tracker script names.
if (trackerScriptName) {
  const names = trackerScriptName?.split(',').map(name => name.trim());

  if (names) {
    names.forEach(name => {
      const normalizedSource = `/${name.replace(/^\/+/, '')}`;

      rewrites.push({
        source: normalizedSource,
        destination: TRACKER_SCRIPT,
      });

      headers.push({
        source: normalizedSource,
        headers: trackerHeaders,
      });
    });
  }
}

if (isProd && cloudMode) {
  rewrites.push({
    source: '/script.js',
    destination: 'https://cloud.umami.is/script.js',
  });
}

/** @type {import('next').NextConfig} */
export default withNextIntl({
  reactStrictMode: false,
  env: {
    apiUrl,
    basePath,
    cloudMode,
    cloudUrl,
    currentVersion: pkg.version,
    defaultCurrency,
    defaultLocale,
    selfTrack,
    selfRecord,
  },
  basePath,
  output: isVercel ? undefined : 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    useTypeScriptCli: true,
  },
  async headers() {
    return headers;
  },
  async rewrites() {
    return [
      ...rewrites,
      {
        source: '/telemetry.js',
        destination: '/api/scripts/telemetry',
      },
      {
        source: '/teams/:teamId/:path*',
        destination: '/:path*',
      },
    ];
  },
  async redirects() {
    return [...redirects];
  },
});
