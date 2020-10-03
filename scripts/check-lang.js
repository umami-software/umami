const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const messages = require('../lang/en-US.json');

const dir = path.resolve(__dirname, '../lang');
const files = fs.readdirSync(dir);
const keys = Object.keys(messages).sort();

files.forEach(file => {
  if (file !== 'en-US.json') {
    const lang = require(`../lang/${file}`);

    console.log(chalk.yellowBright(`\n## ${file}`));
    keys.forEach(key => {
      const orig = messages[key];
      const check = lang[key];

      if (!check || check === orig) {
        console.log(chalk.redBright('*'), chalk.greenBright(`${key}:`), orig);
      }
    });
  }
});
