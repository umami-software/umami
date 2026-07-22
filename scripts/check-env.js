/* eslint-disable no-console */
import 'dotenv/config';

function checkMissing(vars) {
  const missing = vars.reduce((arr, key) => {
    if (!process.env[key]) {
      arr.push(key);
    }
    return arr;
  }, []);

  if (missing.length) {
    console.log(`The following environment variables are not defined:`);
    for (const item of missing) {
      console.log(' - ', item);
    }
    process.exit(1);
  }
}

if (!process.env.SKIP_DB_CHECK && !process.env.DATABASE_TYPE) {
  checkMissing(['DATABASE_URL']);
}

if (process.env.CLOUD_URL) {
  checkMissing(['CLOUD_URL', 'CLICKHOUSE_URL', 'REDIS_URL']);
}

if (!process.env.APP_SECRET) {
  console.log(
    'Warning: APP_SECRET is not defined. Session cookies and share tokens will be signed with a secret derived from DATABASE_URL.',
  );
}
