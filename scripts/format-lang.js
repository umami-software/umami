import path from 'node:path';
import fs from 'fs-extra';
import del from 'del';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const src = path.resolve(process.cwd(), 'src/lang');
const dest = path.resolve(process.cwd(), 'build/messages');
const files = fs.readdirSync(src);

del.sync([path.join(dest)]);

/*
This script takes the files from the `lang` folder and formats them into
the format that format-js expects.
 */
async function run() {
  await fs.ensureDir(dest);

  files.forEach(file => {
    const lang = require(path.resolve(process.cwd(), `src/lang/${file}`));
    const keys = Object.keys(lang).sort();

    const formatted = keys.reduce((obj, key) => {
      obj[key] = { defaultMessage: lang[key] };
      return obj;
    }, {});

    const json = JSON.stringify(formatted, null, 2);

    fs.writeFileSync(path.resolve(dest, file), json);
  });
}

run();
