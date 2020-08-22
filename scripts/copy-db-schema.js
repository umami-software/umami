require('dotenv').config();
const fs = require('fs');
const path = require('path');

const databaseType = process.env.DATABASE_TYPE || process.env.DATABASE_URL.split(':')[0];

if (!databaseType) {
  throw new Error('Database schema not specified');
}

console.log(`Database schema detected: ${databaseType}`);

const src = path.resolve(__dirname, `../prisma/schema.${databaseType}.prisma`);
const dest = path.resolve(__dirname, '../prisma/schema.prisma');

fs.copyFileSync(src, dest);

console.log(`Copied ${src} to ${dest}`);
