const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const root = require('../lang/en-US.json');

const dir = path.resolve(__dirname, '../lang');
const files = fs.readdirSync(dir);
const keys = Object.keys(root).sort();

files.forEach(file => {
  const lang = require(`../lang/${file}`);

  console.log(`Merging ${file}`);

  const merged = keys.reduce((obj, key) => {
    const message = lang[key];

    obj[key] = message || root[key];

    if (!message) {
      console.log(`* Added key ${key}`);
    }

    return obj;
  }, {});

  const json = prettier.format(JSON.stringify(merged), { parser: 'json' });

  fs.writeFileSync(path.resolve(dir, file), json);
});
