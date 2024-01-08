export const PRISMA = 'prisma';
export const POSTGRESQL = 'postgresql';
export const MYSQL = 'mysql';
export const CLICKHOUSE = 'clickhouse';
export const KAFKA = 'kafka';
export const KAFKA_PRODUCER = 'kafka-producer';

// Fixes issue with converting bigint values
BigInt.prototype['toJSON'] = function () {
  return Number(this);
};

export function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = url && url.split(':')[0];

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  if (process.env.CLICKHOUSE_URL) {
    return CLICKHOUSE;
  }

  return type;
}

export async function runQuery(queries: any) {
  const db = getDatabaseType(process.env.CLICKHOUSE_URL || process.env.DATABASE_URL);

  if (db === POSTGRESQL || db === MYSQL) {
    return queries[PRISMA]();
  }

  if (db === CLICKHOUSE) {
    if (queries[KAFKA]) {
      return queries[KAFKA]();
    }

    return queries[CLICKHOUSE]();
  }
}

export function notImplemented() {
  throw new Error('Not implemented.');
}
