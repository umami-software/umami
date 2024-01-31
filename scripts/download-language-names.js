/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const chalk = require('chalk');

const src = path.resolve(__dirname, '../src/lang');
const dest = path.resolve(__dirname, '../public/intl/language');
const files = fs.readdirSync(src);

const getUrl = locale =>
  `https://raw.githubusercontent.com/umpirsky/language-list/master/data/${locale}/language.json`;

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const download = async files => {
  await fs.ensureDir(dest);

  await asyncForEach(files, async file => {
    const locale = file.replace('-', '_').replace('.json', '');

    const filename = path.join(dest, file);
    if (!fs.existsSync(filename)) {
      await new Promise(resolve => {
        https.get(getUrl(locale), res => {
          console.log('Downloaded', chalk.greenBright('->'), filename);
          resolve(res.pipe(fs.createWriteStream(filename)));
        });
      });
    }
  });
};

download(files);
