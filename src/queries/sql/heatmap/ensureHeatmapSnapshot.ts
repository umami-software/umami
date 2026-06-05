import { serializeError } from 'serialize-error';
import { getApiUrl } from '@/lib/api-url';
import clickhouse from '@/lib/clickhouse';
import { uuid } from '@/lib/crypto';
import { getHeatmapSnapshot, putHeatmapSnapshot } from '@/lib/heatmap-r2';
import prisma from '@/lib/prisma';
import { getWebsite } from '@/queries/prisma';

const SNAPSHOT_STATUS = {
  pending: 'pending',
  ready: 'ready',
  failed: 'failed',
} as const;

const SNAPSHOT_RETRY_DELAY_MS = 15 * 60 * 1000;
const SNAPSHOT_PENDING_WINDOW_MS = 30 * 1000;
const SNAPSHOT_DEVICE_SCALE_FACTOR = 1;
const SNAPSHOT_UNAVAILABLE_ERROR = 'Page screenshot unavailable.';
const SNAPSHOT_ERROR_MAX_LENGTH = 500;
export type HeatmapSnapshotStatus = (typeof SNAPSHOT_STATUS)[keyof typeof SNAPSHOT_STATUS];

export interface HeatmapSnapshotImage {
  id: string;
  imageUrl: string | null;
  status: HeatmapSnapshotStatus;
  mimeType: string | null;
  pageW: number;
  pageH: number;
  viewportW: number;
  viewportH: number;
  error: string | null;
}

interface SnapshotRecord {
  id: string;
  websiteId: string;
  urlPath: string;
  viewportW: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  status: HeatmapSnapshotStatus;
  mimeType: string | null;
  objectKey: string | null;
  imageSize: number | null;
  error: string | null;
  hasImage: boolean;
  updatedAt: Date | string | null;
}

interface EnsureHeatmapSnapshotOptions {
  websiteId: string;
  urlPath: string;
  viewportW: number | null;
  viewportH: number | null;
  pageW: number | null;
  pageH: number | null;
}

interface CaptureResult {
  imageData: Buffer;
  mimeType: string;
  pageW: number;
  pageH: number;
}

const CLICKHOUSE_SNAPSHOT_STATUS = {
  pending: 0,
  ready: 1,
  failed: 2,
} as const;

async function measurePage(page: any) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const root = document.scrollingElement || doc || body;
    const rootClientWidth = root?.clientWidth || 0;
    const docClientWidth = doc?.clientWidth || 0;
    const bodyClientWidth = body?.clientWidth || 0;
    const visibleWidth = Math.max(
      window.innerWidth,
      rootClientWidth,
      docClientWidth,
      bodyClientWidth,
    );
    const rootScrollWidth = root?.scrollWidth || 0;
    const docScrollWidth = doc?.scrollWidth || 0;
    const bodyScrollWidth = body?.scrollWidth || 0;
    const horizontalOverflow = Math.max(
      rootScrollWidth - rootClientWidth,
      docScrollWidth - docClientWidth,
      bodyScrollWidth - bodyClientWidth,
      0,
    );
    let maxRight = 0;
    let maxBottom = 0;

    if (body) {
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT);
      let node = walker.currentNode as Element | null;

      while (node) {
        const rect = node.getBoundingClientRect?.();

        if (rect && (rect.width > 0 || rect.height > 0)) {
          maxRight = Math.max(maxRight, rect.right);
          maxBottom = Math.max(maxBottom, rect.bottom);
        }

        node = walker.nextNode() as Element | null;
      }
    }

    const pageW =
      horizontalOverflow > 24
        ? Math.max(visibleWidth, rootScrollWidth, docScrollWidth, bodyScrollWidth)
        : visibleWidth;
    const pageH = Math.max(
      window.innerHeight,
      root?.scrollHeight || 0,
      doc?.scrollHeight || 0,
      body?.scrollHeight || 0,
      Math.ceil(maxBottom),
    );

    return {
      pageW: Math.ceil(pageW),
      pageH: Math.ceil(pageH),
    };
  });
}

async function warmLazyContent(page: any) {
  await page.evaluate(async () => {
    const root = document.scrollingElement || document.documentElement;

    if (!root) {
      return;
    }

    const maxScrollTop = Math.max(0, root.scrollHeight - window.innerHeight);

    if (maxScrollTop <= 0) {
      return;
    }

    const targets = [
      Math.min(window.innerHeight, maxScrollTop),
      Math.min(Math.round(maxScrollTop * 0.25), maxScrollTop),
      Math.min(Math.round(maxScrollTop * 0.5), maxScrollTop),
      Math.min(Math.round(maxScrollTop * 0.75), maxScrollTop),
      maxScrollTop,
    ].filter((value, index, values) => value > 0 && values.indexOf(value) === index);

    for (const top of targets) {
      window.scrollTo(0, top);
      await new Promise(resolve => window.setTimeout(resolve, 350));
    }

    window.scrollTo(0, 0);
    await new Promise(resolve => window.setTimeout(resolve, 250));
  });
}

function getSchema() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  try {
    const connectionUrl = new URL(databaseUrl);

    return connectionUrl.searchParams.get('schema');
  } catch {
    return null;
  }
}

async function rawExecute(sql: string, data: Record<string, any> = {}) {
  const params: any[] = [];
  const schema = getSchema();

  if (schema) {
    await prisma.client.$executeRawUnsafe(`SET search_path TO "${schema}";`);
  }

  const query = sql.replaceAll(/\{\{\s*(\w+)(::\w+)?\s*}}/g, (...args) => {
    const [, name, type] = args;

    params.push(data[name]);

    return `$${params.length}${type ?? ''}`;
  });

  return prisma.client.$executeRawUnsafe(query, ...params);
}

async function findSnapshot(
  websiteId: string,
  urlPath: string,
  viewportW: number,
  viewportH: number,
): Promise<SnapshotRecord | null> {
  if (clickhouse.enabled) {
    return findClickhouseSnapshot(websiteId, urlPath, viewportW, viewportH);
  }

  return findRelationalSnapshot(websiteId, urlPath, viewportW, viewportH);
}

async function findRelationalSnapshot(
  websiteId: string,
  urlPath: string,
  viewportW: number,
  viewportH: number,
): Promise<SnapshotRecord | null> {
  const rows = await prisma.rawQuery(
    `
    select
      snapshot_id as id,
      website_id as "websiteId",
      url_path as "urlPath",
      viewport_w as "viewportW",
      viewport_h as "viewportH",
      page_w as "pageW",
      page_h as "pageH",
      status,
      mime_type as "mimeType",
      null as "objectKey",
      image_size as "imageSize",
      error,
      image_data is not null as "hasImage",
      updated_at as "updatedAt"
    from heatmap_snapshot
    where website_id = {{websiteId::uuid}}
      and url_path = {{urlPath}}
      and viewport_w = {{viewportW}}
      and viewport_h = {{viewportH}}
    limit 1
    `,
    { websiteId, urlPath, viewportW, viewportH },
    'findHeatmapSnapshot',
  );

  return rows?.[0] ?? null;
}

async function findClickhouseSnapshot(
  websiteId: string,
  urlPath: string,
  viewportW: number,
  viewportH: number,
): Promise<SnapshotRecord | null> {
  const rows = await clickhouse.rawQuery<
    {
      id: string;
      websiteId: string;
      urlPath: string;
      viewportW: number;
      viewportH: number;
      pageW: number;
      pageH: number;
      status: number;
      mimeType: string | null;
      objectKey: string;
      imageSize: number | null;
      error: string | null;
      createdAt: string;
    }[]
  >(
    `
    select
      snapshot_id as id,
      website_id as websiteId,
      url_path as urlPath,
      viewport_w as viewportW,
      viewport_h as viewportH,
      page_w as pageW,
      page_h as pageH,
      status,
      mime_type as mimeType,
      object_key as objectKey,
      image_size as imageSize,
      error,
      created_at as createdAt
    from heatmap_snapshot
    where website_id = {websiteId:UUID}
      and url_path = {urlPath:String}
      and viewport_w = {viewportW:UInt32}
      and viewport_h = {viewportH:UInt32}
    order by created_at desc
    limit 1
    `,
    { websiteId, urlPath, viewportW, viewportH },
    'findHeatmapSnapshot',
  );

  const row = rows?.[0];

  if (!row) {
    return null;
  }

  const status = Object.entries(CLICKHOUSE_SNAPSHOT_STATUS).find(
    ([, value]) => value === row.status,
  )?.[0];

  if (!status) {
    return null;
  }

  return {
    ...row,
    status: SNAPSHOT_STATUS[status as keyof typeof SNAPSHOT_STATUS],
    mimeType: row.mimeType || null,
    objectKey: row.objectKey || null,
    hasImage: row.status === CLICKHOUSE_SNAPSHOT_STATUS.ready && Boolean(row.objectKey),
    updatedAt: row.createdAt,
  };
}

function getSnapshotImageUrl(websiteId: string, snapshotId: string) {
  return getApiUrl(`/websites/${websiteId}/heatmaps/snapshots/${snapshotId}`, {
    apiUrl: process.env.API_URL,
    basePath: process.env.BASE_PATH,
  });
}

function mapSnapshot(websiteId: string, row: SnapshotRecord): HeatmapSnapshotImage {
  return {
    id: row.id,
    imageUrl:
      row.status === SNAPSHOT_STATUS.ready && row.hasImage
        ? getSnapshotImageUrl(websiteId, row.id)
        : null,
    status: row.status,
    mimeType: row.mimeType,
    pageW: Number(row.pageW),
    pageH: Number(row.pageH),
    viewportW: Number(row.viewportW),
    viewportH: Number(row.viewportH),
    error: row.error,
  };
}

function getFirstDomain(domain?: string | null) {
  return domain?.split(',')[0]?.trim() || null;
}

function getWebsiteOrigin(domain?: string | null) {
  const host = getFirstDomain(domain);

  if (!host) {
    return null;
  }

  if (host.startsWith('http://') || host.startsWith('https://')) {
    return new URL(host);
  }

  const protocol =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')
      ? 'http'
      : 'https';

  return new URL(`${protocol}://${host}`);
}

function buildCaptureUrl(domain: string | null | undefined, urlPath: string) {
  const origin = getWebsiteOrigin(domain);

  if (!origin) {
    return null;
  }

  return new URL(urlPath || '/', origin).toString();
}

export function shouldSkipSnapshot(urlPath: string) {
  // Internal Umami app routes cannot be rendered from the tracked website domain.
  return urlPath.startsWith('/teams/');
}

async function upsertSnapshotRecord({
  id,
  websiteId,
  urlPath,
  viewportW,
  viewportH,
  pageW,
  pageH,
  status,
  mimeType,
  imageData,
  objectKey,
  error,
}: {
  id: string;
  websiteId: string;
  urlPath: string;
  viewportW: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  status: HeatmapSnapshotStatus;
  mimeType: string | null;
  imageData: Buffer | null;
  objectKey?: string | null;
  error: string | null;
}) {
  if (clickhouse.enabled) {
    return insertClickhouseSnapshotRecord({
      id,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW,
      pageH,
      status,
      mimeType,
      objectKey: objectKey ?? null,
      imageSize: imageData?.byteLength ?? null,
      error,
    });
  }

  return upsertRelationalSnapshotRecord({
    id,
    websiteId,
    urlPath,
    viewportW,
    viewportH,
    pageW,
    pageH,
    status,
    mimeType,
    imageData,
    error,
  });
}

async function upsertRelationalSnapshotRecord({
  id,
  websiteId,
  urlPath,
  viewportW,
  viewportH,
  pageW,
  pageH,
  status,
  mimeType,
  imageData,
  error,
}: {
  id: string;
  websiteId: string;
  urlPath: string;
  viewportW: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  status: HeatmapSnapshotStatus;
  mimeType: string | null;
  imageData: Buffer | null;
  error: string | null;
}) {
  return rawExecute(
    `
    insert into heatmap_snapshot (
      snapshot_id,
      website_id,
      url_path,
      viewport_w,
      viewport_h,
      page_w,
      page_h,
      status,
      mime_type,
      image_data,
      image_size,
      error,
      created_at,
      updated_at
    )
    values (
      {{id::uuid}},
      {{websiteId::uuid}},
      {{urlPath}},
      {{viewportW}},
      {{viewportH}},
      {{pageW}},
      {{pageH}},
      {{status}},
      {{mimeType}},
      {{imageData}},
      {{imageSize}},
      {{error}},
      now(),
      now()
    )
    on conflict (website_id, url_path, viewport_w, viewport_h) do update
    set
      page_w = excluded.page_w,
      page_h = excluded.page_h,
      status = excluded.status,
      mime_type = excluded.mime_type,
      image_data = excluded.image_data,
      image_size = excluded.image_size,
      error = excluded.error,
      updated_at = now()
    `,
    {
      id,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW,
      pageH,
      status,
      mimeType,
      imageData,
      imageSize: imageData?.byteLength ?? null,
      error,
    },
  );
}

async function insertClickhouseSnapshotRecord({
  id,
  websiteId,
  urlPath,
  viewportW,
  viewportH,
  pageW,
  pageH,
  status,
  mimeType,
  objectKey,
  imageSize,
  error,
}: {
  id: string;
  websiteId: string;
  urlPath: string;
  viewportW: number;
  viewportH: number;
  pageW: number;
  pageH: number;
  status: HeatmapSnapshotStatus;
  mimeType: string | null;
  objectKey: string | null;
  imageSize: number | null;
  error: string | null;
}) {
  return clickhouse.insert('heatmap_snapshot', [
    {
      snapshot_id: id,
      website_id: websiteId,
      url_path: urlPath,
      viewport_w: viewportW,
      viewport_h: viewportH,
      page_w: pageW,
      page_h: pageH,
      status: CLICKHOUSE_SNAPSHOT_STATUS[status],
      mime_type: mimeType || '',
      object_key: objectKey || '',
      image_size: imageSize,
      error,
      created_at: clickhouse.getUTCString(),
    },
  ]);
}

function getSnapshotObjectKey(
  websiteId: string,
  snapshotId: string,
  viewportW: number,
  viewportH: number,
) {
  return `${websiteId}/${viewportW}x${viewportH}/${snapshotId}.png`;
}

function getSnapshotErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? [error.name, error.message].filter(Boolean).join(': ')
      : typeof error === 'string'
        ? error
        : SNAPSHOT_UNAVAILABLE_ERROR;

  return message.slice(0, SNAPSHOT_ERROR_MAX_LENGTH) || SNAPSHOT_UNAVAILABLE_ERROR;
}

async function createSnapshotBrowser() {
  const endpoint = process.env.PLAYWRIGHT_URL?.trim();

  if (endpoint) {
    const { chromium } = await import('playwright-core');
    return chromium.connect(endpoint);
  }

  const { chromium } = await import('@playwright/test');
  return chromium.launch({
    channel: 'chromium',
    headless: true,
  });
}

async function captureSnapshot(
  url: string,
  viewportW: number,
  viewportH: number,
  pageW?: number,
): Promise<CaptureResult> {
  const browser = await createSnapshotBrowser();
  const initialViewportW = viewportW;

  try {
    const context = await browser.newContext({
      viewport: { width: initialViewportW, height: viewportH },
      screen: { width: initialViewportW, height: viewportH },
      deviceScaleFactor: SNAPSHOT_DEVICE_SCALE_FACTOR,
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
    await page.waitForTimeout(500);
    await warmLazyContent(page);
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(300);

    let dimensions = await measurePage(page);
    let currentWidth = initialViewportW;
    let captureWidth =
      dimensions.pageW > initialViewportW + 24
        ? Math.max(initialViewportW, dimensions.pageW)
        : initialViewportW;

    for (let i = 0; i < 3; i++) {
      if (captureWidth <= currentWidth) {
        break;
      }

      currentWidth = captureWidth;

      await page.setViewportSize({
        width: currentWidth,
        height: viewportH,
      });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => undefined);
      await page.waitForTimeout(300);

      dimensions = await measurePage(page);
      captureWidth = Math.max(currentWidth, dimensions.pageW);
    }

    const imageData = Buffer.from(await page.screenshot({ fullPage: true, type: 'png' }));

    await context.close();

    return {
      imageData,
      mimeType: 'image/png',
      pageW: dimensions.pageW,
      pageH: dimensions.pageH,
    };
  } finally {
    await browser.close();
  }
}

export async function ensureHeatmapSnapshot({
  websiteId,
  urlPath,
  viewportW,
  viewportH,
  pageW,
  pageH,
}: EnsureHeatmapSnapshotOptions): Promise<HeatmapSnapshotImage | null> {
  if (!urlPath || !viewportW || !viewportH || !pageW || !pageH) {
    return null;
  }

  if (shouldSkipSnapshot(urlPath)) {
    return null;
  }

  const existing = await findSnapshot(websiteId, urlPath, viewportW, viewportH);

  if (existing?.status === SNAPSHOT_STATUS.ready && existing.hasImage) {
    return mapSnapshot(websiteId, existing);
  }

  const updatedAt = existing?.updatedAt ? new Date(existing.updatedAt) : null;
  const ageMs = updatedAt ? Date.now() - updatedAt.getTime() : Number.POSITIVE_INFINITY;

  if (existing?.status === SNAPSHOT_STATUS.pending && ageMs < SNAPSHOT_PENDING_WINDOW_MS) {
    return mapSnapshot(websiteId, existing);
  }

  if (existing?.status === SNAPSHOT_STATUS.failed && ageMs < SNAPSHOT_RETRY_DELAY_MS) {
    return mapSnapshot(websiteId, existing);
  }

  const snapshotId = existing?.id ?? uuid();
  const website = await getWebsite(websiteId);
  const captureUrl = buildCaptureUrl(website?.domain, urlPath);

  if (!captureUrl) {
    await upsertSnapshotRecord({
      id: snapshotId,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW,
      pageH,
      status: SNAPSHOT_STATUS.failed,
      mimeType: null,
      imageData: null,
      error: SNAPSHOT_UNAVAILABLE_ERROR,
    });

    const failed = await findSnapshot(websiteId, urlPath, viewportW, viewportH);

    return failed ? mapSnapshot(websiteId, failed) : null;
  }

  await upsertSnapshotRecord({
    id: snapshotId,
    websiteId,
    urlPath,
    viewportW,
    viewportH,
    pageW,
    pageH,
    status: SNAPSHOT_STATUS.pending,
    mimeType: null,
    imageData: null,
    error: null,
  });

  try {
    const capture = await captureSnapshot(captureUrl, viewportW, viewportH, pageW);
    const objectKey = clickhouse.enabled
      ? getSnapshotObjectKey(websiteId, snapshotId, viewportW, viewportH)
      : null;

    if (objectKey) {
      await putHeatmapSnapshot(objectKey, capture.imageData, capture.mimeType);
    }

    await upsertSnapshotRecord({
      id: snapshotId,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW: capture.pageW,
      pageH: capture.pageH,
      status: SNAPSHOT_STATUS.ready,
      mimeType: capture.mimeType,
      imageData: clickhouse.enabled ? null : capture.imageData,
      objectKey,
      error: null,
    });
  } catch (error) {
    console.error('Heatmap snapshot capture failed', {
      captureUrl,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW,
      pageH,
      error: serializeError(error),
    });

    await upsertSnapshotRecord({
      id: snapshotId,
      websiteId,
      urlPath,
      viewportW,
      viewportH,
      pageW,
      pageH,
      status: SNAPSHOT_STATUS.failed,
      mimeType: null,
      imageData: null,
      error: getSnapshotErrorMessage(error),
    });
  }

  const snapshot = await findSnapshot(websiteId, urlPath, viewportW, viewportH);

  return snapshot ? mapSnapshot(websiteId, snapshot) : null;
}

export async function getHeatmapSnapshotImage(
  websiteId: string,
  snapshotId: string,
): Promise<{ mimeType: string; imageData: Buffer } | null> {
  if (clickhouse.enabled) {
    const rows = await clickhouse.rawQuery<{ mimeType: string; objectKey: string }[]>(
      `
      select
        mime_type as mimeType,
        object_key as objectKey
      from heatmap_snapshot
      where snapshot_id = {snapshotId:UUID}
        and website_id = {websiteId:UUID}
        and status = {status:UInt8}
        and object_key != ''
      order by created_at desc
      limit 1
      `,
      {
        websiteId,
        snapshotId,
        status: CLICKHOUSE_SNAPSHOT_STATUS.ready,
      },
      'getHeatmapSnapshotImage',
    );

    const row = rows?.[0];

    if (!row?.objectKey) {
      return null;
    }

    return getHeatmapSnapshot(row.objectKey);
  }

  const rows = await prisma.rawQuery(
    `
    select
      mime_type as "mimeType",
      image_data as "imageData"
    from heatmap_snapshot
    where snapshot_id = {{snapshotId::uuid}}
      and website_id = {{websiteId::uuid}}
      and status = 'ready'
      and image_data is not null
    limit 1
    `,
    { websiteId, snapshotId },
    'getHeatmapSnapshotImage',
  );

  const row = rows?.[0];

  if (!row?.imageData || !row?.mimeType) {
    return null;
  }

  return {
    mimeType: row.mimeType,
    imageData: Buffer.from(row.imageData),
  };
}
