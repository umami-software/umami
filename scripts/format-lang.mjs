import path from 'node:path';
import url from 'node:url';
import fs from 'fs-extra';
import del from 'del';
import prettier from 'prettier';
import { createRequire } from 'module';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const src = path.resolve(__dirname, '../src/lang');
const dest = path.resolve(__dirname, '../build/messages');
const files = fs.readdirSync(src);

del.sync([path.join(dest)]);

/*
This script takes the files from the `lang` folder and formats them into
the format that format-js expects.
 */
async function run() {
  await fs.ensureDir(dest);

  files.forEach(file => {
    const lang = require(`../src/lang/${file}`);
    const keys = Object.keys(lang).sort();

    const formatted = keys.reduce((obj, key) => {
      obj[key] = { defaultMessage: lang[key] };
      return obj;
    }, {});

    const json = prettier.format(JSON.stringify(formatted), { parser: 'json' });

    fs.writeFileSync(path.resolve(dest, file), json);
  });
}

run();
