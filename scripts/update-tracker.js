require('dotenv').config();
const fs = require('fs');
const path = require('path');

const endPoint = process.env.COLLECT_API_ENDPOINT;

if (endPoint) {
  const file = path.resolve(__dirname, '../public/umami.js');

  const tracker = fs.readFileSync(file);

  fs.writeFileSync(
    path.resolve(file),
    tracker.toString().replace(/"\/api\/collect"/g, `"${endPoint}"`),
  );

  console.log(`Updated tracker endpoint: ${endPoint}.`);
}
