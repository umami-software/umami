/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const messages = require('../build/messages.json');

const dest = path.resolve(__dirname, '../lang');
const files = fs.readdirSync(dest);
const keys = Object.keys(messages).sort();

files.forEach(file => {
  const lang = require(`../lang/${file}`);

  console.log(`Merging ${file}`);

  const merged = keys.reduce((obj, key) => {
    const message = lang[key];

    if (file === 'en-US.json') {
      obj[key] = messages[key].defaultMessage;
    } else {
      obj[key] = message || messages[key].defaultMessage;
    }

    if (!message) {
      console.log(`* Added key ${key}`);
    }

    return obj;
  }, {});

  const json = prettier.format(JSON.stringify(merged), { parser: 'json' });

  fs.writeFileSync(path.resolve(dest, file), json);
});
