const fs = require('fs');
const path = require('path');
const https = require('https');
const chalk = require('chalk');

const src = path.resolve(__dirname, '../lang');
const dest = path.resolve(__dirname, '../public/country');
const files = fs.readdirSync(src);

const getUrl = locale =>
  `https://raw.githubusercontent.com/umpirsky/country-list/master/data/${locale}/country.json`;

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

const download = async files => {
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
