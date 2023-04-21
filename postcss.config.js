const flexBugs = require('postcss-flexbugs-fixes');
const presetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    flexBugs,
    presetEnv({
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    }),
  ],
};
