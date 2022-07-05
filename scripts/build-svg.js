const { readdir, readFileSync, writeFileSync, unlinkSync } = require('fs-extra');

async function main() {
  const dir = 'assets';

  /**
   * @type {string[]}
   */
  const files = await readdir(dir);

  for (const file of files) {
    if (file.endsWith('.svg')) {
      const content = readFileSync(`${dir}/${file}`, {
        encoding: 'utf-8',
      });
      writeFileSync(`${dir}/${file.replace('.svg', '.jsx')}`, `export default () => ${content}`);
      unlinkSync(`${dir}/${file}`);
    }
  }
}

main();
