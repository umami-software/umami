require('dotenv').config();
const pkg = require('./package.json');

const scriptName = process.env.TRACKER_SCRIPT_NAME;

module.exports = {
  env: {
    VERSION: pkg.version,
    FORCE_SSL: Boolean(process.env.FORCE_SSL),
    DISABLE_LOGIN: Boolean(process.env.DISABLE_LOGIN),
    TRACKER_SCRIPT_NAME: scriptName,
  },
  basePath: process.env.BASE_PATH,
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
  async rewrites() {
    return scriptName ? [{ source: `/${scriptName}.js`, destination: '/umami.js' }] : [];
  },
  async headers() {
    return [
      {
        source: `/${scriptName || 'umami'}.js`,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30 days
          },
        ],
      },
    ];
  },
};
