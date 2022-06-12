require('dotenv').config();
const fse = require('fs-extra');
const path = require('path');

function getDatabase() {
  const type =
    process.env.DATABASE_TYPE ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.split(':')[0]);

  if (type === 'postgres') {
    return 'postgresql';
  }

  return type;
}

const databaseType = getDatabase();

if (!databaseType || !['mysql', 'postgresql'].includes(databaseType)) {
  throw new Error('Missing or invalid database');
}

console.log(`Database type detected: ${databaseType}`);

const src = path.resolve(__dirname, `../prisma/schema.${databaseType}.prisma`);
const dest = path.resolve(__dirname, '../prisma/schema.prisma');

fse.copyFileSync(src, dest);

console.log(`Copied ${src} to ${dest}`);

const srcMigrations = path.resolve(__dirname, `../prisma/${databaseType}/migrations`);
const destMigrations = path.resolve(__dirname, `../prisma/migrations`);

fse.copySync(srcMigrations, destMigrations);

console.log(`Copied ${srcMigrations} to ${destMigrations}`);
