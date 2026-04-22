export const PRISMA = 'prisma';
export const POSTGRESQL = 'postgresql';
export const CLICKHOUSE = 'clickhouse';
export const OCEANBASE = 'oceanbase';
export const KAFKA = 'kafka';
export const KAFKA_PRODUCER = 'kafka-producer';

// Fixes issue with converting bigint values
BigInt.prototype.toJSON = function () {
  return Number(this);
};

export function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = url?.split(':')[0];

  if (type === 'postgres') {
    return POSTGRESQL;
  }

  return type;
}

export async function runQuery(queries: any) {
  // AP database priority: ClickHouse or OceanBase
  if (process.env.CLICKHOUSE_URL) {
    if (queries[KAFKA]) {
      return queries[KAFKA]();
    }

    return queries[CLICKHOUSE]();
  }

  if (process.env.OCEANBASE_URL) {
    return queries[OCEANBASE]();
  }

  // Default to PostgreSQL (Prisma)
  return queries[PRISMA]();
}

export function notImplemented() {
  throw new Error('Not implemented.');
}
