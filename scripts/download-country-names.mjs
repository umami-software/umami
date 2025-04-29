/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'node:path';
import https from 'https';
import chalk from 'chalk';
import url from "node:url";

const src = path.resolve(process.cwd(), 'src/lang');
const dest = path.resolve(process.cwd(), 'public/intl/country');
const files = fs.readdirSync(src);

const getUrl = locale =>
  `https://raw.githubusercontent.com/umpirsky/country-list/master/data/${locale}/country.json`;

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
