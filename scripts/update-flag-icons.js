const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

async function main() {
  const files = fs.readdirSync('./public/images/flags').map(f => f.replace('.svg', ''));
  for (const f of files) {
    // eslint-disable-next-line no-console
    console.log(f);
    let res = await fetch(`https://flagcdn.com/40x30/${f}.png`);
    const w = fs.createWriteStream(`./public/images/flags/${f}.png`);
    await finished(Readable.fromWeb(res.body).pipe(w));
    fs.rmSync(`./public/images/flags/${f}.svg`);
  }
}
main();
