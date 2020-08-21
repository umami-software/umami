require('dotenv').config();
const fs = require('fs');
const path = require('path');

const db = process.env.DATABASE_URL.split(':')[0];

if (!db) {
  throw new Error('Database not specified');
}

console.log(`Database detected: ${db}`);

const src = path.resolve(__dirname, `../prisma/schema.${db}.prisma`);
const dest = path.resolve(__dirname, '../prisma/schema.prisma');

fs.copyFileSync(src, dest);

console.log(`Copied ${src} to ${dest}`);
