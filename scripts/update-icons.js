const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

// missing mappings: android, beaker, blackberry, curl, facebook,
// ie, instagram, ios-webview, miui, searchbot, silk, unknown
const mappings = {
  'android-webview': 'android-webview',
  aol: 'archive/aol-explorer',
  brave: 'brave',
  chrome: 'chrome',
  'chromium-webview': 'chromium',
  crios: 'chrome',
  'edge-chromium': 'edge',
  'edge-ios': 'edge',
  edge: 'archive/edge_12-18',
  firefox: 'firefox',
  fxios: 'firefox',
  'opera-mini': 'opera-mini',
  opera: 'opera',
  safari: 'safari',
  samsung: 'samsung-internet',
  silk: 'silk',
  yandexbrowser: 'yandex',
};

async function main() {
  for (const [k, v] of Object.entries(mappings)) {
    // eslint-disable-next-line no-console
    console.log(k, v);
    let res = await fetch(
      `https://raw.githubusercontent.com/alrra/browser-logos/main/src/${v}/${v
        .split('/')
        .at(-1)}_48x48.png`,
    );
    const w = fs.createWriteStream(`./public/images/browsers/${k}.png`);
    await finished(Readable.fromWeb(res.body).pipe(w));
  }
}
main();
