/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'node:path';
import https from 'https';
import chalk from 'chalk';

const src = path.resolve(process.cwd(), 'src/lang');
const dest = path.resolve(process.cwd(), 'public/intl/language');
const files = fs.readdirSync(src);

const getUrl = locale =>
  `https://raw.githubusercontent.com/umpirsky/language-list/master/data/${locale}/language.json`;

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const downloadFile = (url, filepath) =>
  new Promise(resolve => {
    https
      .get(url, res => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(filepath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log('Downloaded', chalk.greenBright('->'), filepath);
            resolve();
          });
        } else {
          res.resume();
          console.warn(`Warning: ${url} returned ${res.statusCode}`);
          resolve();
        }
      })
      .on('error', err => {
        console.error(`Error downloading ${url}:`, err.message);
        resolve();
      });
  });

const download = async files => {
  await fs.ensureDir(dest);

  await asyncForEach(files, async file => {
    const locale = file.replace('-', '_').replace('.json', '');

    const filename = path.join(dest, file);
    if (!fs.existsSync(filename)) {
      const url = getUrl(locale);
      await downloadFile(url, filename);
    }
  });
};

download(files);
