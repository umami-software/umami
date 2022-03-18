const fs = require('fs-extra');
const path = require('path');
const del = require('del');
const prettier = require('prettier');
const chalk = require('chalk');

const src = path.resolve(__dirname, '../lang');
const dest = path.resolve(__dirname, '../build');
const files = fs.readdirSync(src);

const removed = del.sync([path.join(dest, '*.json')]);

if (removed.length) {
  console.log(removed.map(n => `${n} ${chalk.redBright('✗')}`).join('\n'));
}

async function run() {
  await fs.ensureDir(dest);

  files.forEach(file => {
    const lang = require(`../lang/${file}`);
    const keys = Object.keys(lang).sort();

    const formatted = keys.reduce((obj, key) => {
      obj[key] = { defaultMessage: lang[key] };
      return obj;
    }, {});

    const json = prettier.format(JSON.stringify(formatted), { parser: 'json' });

    fs.writeFileSync(path.resolve(dest, file), json);

    console.log(path.resolve(src, file), chalk.greenBright('->'), path.resolve(dest, file));
  });
}

run();
