require('dotenv').config();
const fse = require('fs-extra');
const path = require('path');
const del = require('del');

function getDatabaseType() {
  const type =
    process.env.DATABASE_TYPE ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.split(':')[0]);

  if (type === 'postgres') {
    return 'postgresql';
  }

  if (type === 'file') {
    return 'sqlite';
  }

  return type;
}

const databaseType = getDatabaseType();

if (!databaseType || !['mysql', 'postgresql', 'sqlite'].includes(databaseType)) {
  throw new Error('Missing or invalid database');
}

console.log(`Database type detected: ${databaseType}`);

const src = path.resolve(__dirname, `../db/${databaseType}`);
const dest = path.resolve(__dirname, '../prisma');

del.sync(dest);

fse.copySync(src, dest);

console.log(`Copied ${src} to ${dest}`);
