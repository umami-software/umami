require('dotenv').config();
const pkg = require('./package.json');

const { BASE_PATH, FORCE_SSL, DISABLE_LOGIN, TRACKER_SCRIPT_NAME } = process.env;

module.exports = {
  env: {
    VERSION: pkg.version,
    FORCE_SSL: Boolean(FORCE_SSL),
    DISABLE_LOGIN: Boolean(DISABLE_LOGIN),
    TRACKER_SCRIPT_NAME,
  },
  basePath: BASE_PATH,
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
    return TRACKER_SCRIPT_NAME
      ? [{ source: `/${TRACKER_SCRIPT_NAME}.js`, destination: '/umami.js' }]
      : [];
  },
  async headers() {
    return [
      {
        source: `/${TRACKER_SCRIPT_NAME || 'umami'}.js`,
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
