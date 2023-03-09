/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const pkg = require('./package.json');

const CLOUD_URL = 'https://cloud.umami.is';

const contentSecurityPolicy = `
  default-src 'self';
  img-src *;
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' api.umami.is;
  frame-ancestors 'self';
`;

const headers = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
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

const redirects = [];

if (process.env.CLOUD_MODE) {
  redirects.push({
    source: '/login',
    destination: CLOUD_URL,
    permanent: false,
  });
}

const config = {
  env: {
    currentVersion: pkg.version,
    isProduction: process.env.NODE_ENV === 'production',
  },
  basePath: process.env.BASE_PATH,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.{js|jsx|ts|tsx}$/,
      use: ['@svgr/webpack'],
    });

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
