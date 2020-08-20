require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getDatabase, getNpmCommand, runCommand } = require('./common');

(async () => {
  const db = getDatabase();

  if (!db) {
    throw new Error('Database not specified');
  }

  const src = path.resolve(__dirname, `../prisma/schema.${db}.prisma`);
  const dest = path.resolve(__dirname, '../prisma/schema.prisma');

  fs.copyFileSync(src, dest);

  await runCommand(getNpmCommand(), ['run', 'prisma-generate']).catch(err => {
    console.error(err);
    process.exit(1);
  });
})();
