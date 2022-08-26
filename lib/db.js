import { POSTGRESQL, RELATIONAL, MYSQL, KAFKA } from 'lib/constants';
import { CLICKHOUSE } from 'lib/constants';

BigInt.prototype.toJSON = function () {
  return Number(this);
};

export function getDatabase(database, databaseType, fallback) {
  const type = databaseType || (database && database.split(':')[0]);

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  if (!type) {
    return getDatabase(fallback);
  }

  return type;
}

export async function runAnalyticsQuery(queries) {
  const db = getDatabase(process.env.ANALYTICS_URL, null, process.env.DATABASE_URL);

  if (db === POSTGRESQL || db === MYSQL) {
    return queries[RELATIONAL]();
  }

  if (db === CLICKHOUSE) {
    const kafka = getDatabase(process.env.KAFKA_URL);
    if (kafka === KAFKA && queries[KAFKA]) {
      return queries[KAFKA]();
    }
    return queries[CLICKHOUSE]();
  }
}
