import clickhouse from '@/lib/clickhouse';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

export interface SavePerformanceArgs {
  websiteId: string;
  sessionId: string;
  visitId: string;
  urlPath: string;
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  createdAt: Date;
}

export async function savePerformance(args: SavePerformanceArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(args),
    [CLICKHOUSE]: () => clickhouseQuery(args),
  });
}

async function relationalQuery(data: SavePerformanceArgs) {
  const { websiteId, sessionId, visitId, urlPath, lcp, inp, cls, fcp, ttfb, createdAt } = data;

  await prisma.client.performance.create({
    data: {
      id: uuid(),
      websiteId,
      sessionId,
      visitId,
      urlPath: urlPath?.substring(0, 500),
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      createdAt,
    },
  });
}

async function clickhouseQuery(data: SavePerformanceArgs) {
  const { websiteId, sessionId, visitId, urlPath, lcp, inp, cls, fcp, ttfb, createdAt } = data;
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    visit_id: visitId,
    url_path: urlPath?.substring(0, 500),
    lcp: lcp ?? null,
    inp: inp ?? null,
    cls: cls ?? null,
    fcp: fcp ?? null,
    ttfb: ttfb ?? null,
    created_at: getUTCString(createdAt),
  };

  if (kafka.enabled) {
    await sendMessage('performance', message);
  } else {
    await insert('website_performance', [message]);
  }
}
