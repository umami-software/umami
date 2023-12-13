/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const path = require('path');
const pkg = require('./package.json');

const contentSecurityPolicy = [
  `default-src 'self'`,
  `img-src *`,
  `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `connect-src 'self' api.umami.is`,
  `frame-ancestors 'self' ${process.env.ALLOWED_FRAME_URLS || ''}`,
];

const headers = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy
      .join(';')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
];

if (process.env.FORCE_SSL) {
  headers.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const rewrites = [];

if (process.env.COLLECT_API_ENDPOINT) {
  rewrites.push({
    source: process.env.COLLECT_API_ENDPOINT,
    destination: '/api/send',
  });
}

if (process.env.TRACKER_SCRIPT_NAME) {
  const names = process.env.TRACKER_SCRIPT_NAME?.split(',').map(name => name.trim());

  if (names) {
    names.forEach(name => {
      rewrites.push({
        source: `/${name.replace(/^\/+/, '')}`,
        destination: '/script.js',
      });
    });
  }
}

const redirects = [
  {
    source: '/settings',
    destination: process.env.CLOUD_MODE
      ? `${process.env.CLOUD_URL}/settings/websites`
      : '/settings/websites',
    permanent: true,
  },
];

if (process.env.CLOUD_MODE && process.env.CLOUD_URL && process.env.DISABLE_LOGIN) {
  redirects.push({
    source: '/login',
    destination: process.env.CLOUD_URL,
    permanent: false,
  });
}

const basePath = process.env.BASE_PATH;

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  env: {
    basePath: basePath || '',
    cloudMode: process.env.CLOUD_MODE || '',
    cloudUrl: process.env.CLOUD_URL || '',
    configUrl: '/config',
    currentVersion: pkg.version,
    defaultLocale: process.env.DEFAULT_LOCALE || '',
    disableLogin: process.env.DISABLE_LOGIN || '',
    disableUI: process.env.DISABLE_UI || '',
    hostUrl: process.env.HOST_URL || '',
  },
  basePath,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(rule => rule.test?.test?.('.svg'));

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;

    config.resolve.alias['public'] = path.resolve('./public');

    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
  async rewrites() {
    return [
      ...rewrites,
      {
        source: '/telemetry.js',
        destination: '/api/scripts/telemetry',
      },
    ];
  },
  async redirects() {
    return [...redirects];
  },
};

module.exports = config;
