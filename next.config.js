require('dotenv').config();
const pkg = require('./package.json');

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

module.exports = {
  env: {
    currentVersion: pkg.version,
    isProduction: process.env.NODE_ENV === 'production',
  },
  basePath: process.env.BASE_PATH,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.js$/,
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
      {
        source: '/telemetry.js',
        destination: '/api/scripts/telemetry',
      },
    ];
  },
};
