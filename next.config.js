require('dotenv').config();

module.exports = {
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
