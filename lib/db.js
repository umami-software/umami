import { POSTGRESQL, RELATIONAL, MYSQL, KAFKA, CLICKHOUSE } from 'lib/constants';

BigInt.prototype.toJSON = function () {
  return Number(this);
};

export function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = process.env.DATABASE_TYPE || (url && url.split(':')[0]);

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  return type;
}

export async function runAnalyticsQuery(queries) {
  const db = getDatabaseType(process.env.ANALYTICS_URL || process.env.DATABASE_URL);

  if (db === POSTGRESQL || db === MYSQL) {
    return queries[RELATIONAL]();
  }

  if (db === CLICKHOUSE) {
    if (queries[KAFKA]) {
      return queries[KAFKA]();
    }

    return queries[CLICKHOUSE]();
  }
}
