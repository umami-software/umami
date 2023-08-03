import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';

export interface GetInsightsCriteria {
  startDate: Date;
  endDate: Date;
  fields: string[];
  filters: string[];
  groups: string[];
}

export async function getInsights(...args: [websiteId: string, criteria: GetInsightsCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: GetInsightsCriteria,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  return null;
}

async function clickhouseQuery(
  websiteId: string,
  criteria: GetInsightsCriteria,
): Promise<
  {
    x: string;
    y: number;
  }[]
> {
  return null;
}
