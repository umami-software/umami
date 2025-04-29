/* eslint-disable no-console */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const endPoint = process.env.COLLECT_API_ENDPOINT;

if (endPoint) {
  const file = path.resolve(__dirname, '../public/script.js');

  const tracker = fs.readFileSync(file);

  fs.writeFileSync(path.resolve(file), tracker.toString().replace(/\/api\/send/g, endPoint));

  console.log(`Updated tracker endpoint: ${endPoint}.`);
}
