require('dotenv').config();
const pkg = require('./package.json');

module.exports = {
  env: {
    VERSION: pkg.version,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.js$/,
      },
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
