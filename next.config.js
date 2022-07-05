require('dotenv').config();
const pkg = require('./package.json');

module.exports = {
  env: {
    currentVersion: pkg.version,
    loginDisabled: process.env.DISABLE_LOGIN,
    updatesDisabled: process.env.DISABLE_UPDATES,
  },
  basePath: process.env.BASE_PATH,
  experimental: {
    outputStandalone: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: `/(.*\\.js)`,
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
