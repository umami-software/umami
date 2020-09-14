const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const src = path.resolve(__dirname, '../lang');
const dest = path.resolve(__dirname, '../build');
const files = fs.readdirSync(src);

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

files.forEach(file => {
  const lang = require(`../lang/${file}`);
  const keys = Object.keys(lang).sort();

  const formatted = keys.reduce((obj, key) => {
    obj[key] = { defaultMessage: lang[key] };
    return obj;
  }, {});

  const json = prettier.format(JSON.stringify(formatted), { parser: 'json' });

  fs.writeFileSync(path.resolve(dest, file), json);

  console.log(path.resolve(src, file), '->', path.resolve(dest, file));
});
