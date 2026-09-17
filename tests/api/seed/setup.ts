import type { ApiClient } from '../client';
import { login } from '../helpers/auth';
import { ADMIN_USER } from '../helpers/constants';
import { assertStatus } from '../helpers/entities';
import { buildDataset, CURRENCY, type Dataset, HOSTNAME } from './dataset';
import {
  SEED_IDS,
  SEED_LINK,
  SEED_PIXEL,
  SEED_SHARE,
  SEED_TEAM,
  SEED_USERS,
  SEED_WEBSITES,
} from './ids';
import { type IngestResult, ingestDataset } from './ingest';
import type { SeedCredentials, SeedState } from './state';

const READINESS_TIMEOUT_MS = 60_000;

async function ensureUser(
  admin: ApiClient,
  credentials: { username: string; password: string; role: string },
): Promise<SeedCredentials> {
  const created = await admin.post('/api/users', credentials);

  if (created.status === 200) {
    return { ...credentials, id: created.body.id };
  }

  if (created.status !== 400) {
    throw new Error(
      `Failed to create ${credentials.username} (${created.status}): ${created.text}`,
    );
  }

  // Already exists (re-run against a kept stack): look it up.
  const users = assertStatus(
    await admin.get('/api/admin/users', { params: { search: credentials.username } }),
    200,
    'list users',
  );
  const user = users.body.data?.find((u: any) => u.username === credentials.username);

  if (!user) {
    throw new Error(`User ${credentials.username} exists but could not be found`);
  }

  return { ...credentials, id: user.id };
}

async function recreateWebsite(
  client: ApiClient,
  id: string,
  data: { name: string; domain: string },
) {
  const existing = await client.get(`/api/websites/${id}`);

  // Admins bypass the permission check, so an unknown id yields 200 with a null body.
  if (existing.status === 200 && existing.body?.id) {
    assertStatus(await client.del(`/api/websites/${id}`), 200, `delete website ${id}`);
  }

  return assertStatus(await client.post('/api/websites', { id, ...data }), 200, 'create website')
    .body;
}

async function ensureEntity(
  client: ApiClient,
  collection: 'links' | 'pixels',
  id: string,
  data: Record<string, unknown>,
) {
  const existing = await client.get(`/api/${collection}/${id}`);

  if (existing.status === 200 && existing.body?.id) {
    return existing.body;
  }

  return assertStatus(
    await client.post(`/api/${collection}`, { id, ...data }),
    200,
    `create ${collection}`,
  ).body;
}

async function ensureTeam(admin: ApiClient, memberId: string) {
  const teams = assertStatus(await admin.get('/api/teams'), 200, 'list teams');
  let team = teams.body.data?.find((t: any) => t.name === SEED_TEAM.name);

  if (!team) {
    const created = assertStatus(await admin.post('/api/teams', SEED_TEAM), 200, 'create team');
    team = created.body[0];
  }

  const detail = assertStatus(await admin.get(`/api/teams/${team.id}`), 200, 'get team').body;
  const member = await admin.post(`/api/teams/${team.id}/users`, {
    userId: memberId,
    role: 'team-member',
  });

  // 400 = already a member (re-run).
  if (member.status !== 200 && member.status !== 400) {
    throw new Error(`Failed to add team member (${member.status}): ${member.text}`);
  }

  return {
    id: detail.id as string,
    name: detail.name as string,
    accessCode: detail.accessCode as string,
  };
}

async function poll<T>(label: string, fn: () => Promise<T | undefined>, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  let last: string | undefined;

  while (Date.now() < deadline) {
    try {
      const result = await fn();

      if (result !== undefined) {
        return result;
      }
    } catch (error) {
      last = (error as Error).message;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${label}${last ? ` (${last})` : ''}`);
}

/**
 * Waits until the analytics queries see the ingested data (ClickHouse
 * materialized views are synchronous, but this guards against any lag) and
 * harvests ids that specs need for path parameters.
 */
async function waitForAnalytics(admin: ApiClient, dataset: Dataset, ingested: IngestResult) {
  const websiteId = SEED_IDS.website;
  const range = () => ({ startAt: dataset.range.startAt, endAt: Date.now() });

  await poll(
    `${dataset.expected.pageviews} pageviews on ${websiteId}`,
    async () => {
      const response = await admin.get(`/api/websites/${websiteId}/stats`, { params: range() });
      // /stats returns flat numbers (possibly as strings under Postgres bigint).
      const pageviews = Number(response.body?.pageviews ?? 0);

      return pageviews >= dataset.expected.pageviews ? pageviews : undefined;
    },
    READINESS_TIMEOUT_MS,
  );

  const sessionId = await poll(
    'a session',
    async () => {
      const response = await admin.get(`/api/websites/${websiteId}/sessions`, {
        params: { ...range(), pageSize: 1 },
      });

      return response.body?.data?.[0]?.id as string | undefined;
    },
    READINESS_TIMEOUT_MS,
  );

  const eventId = await poll(
    'a custom event with data',
    async () => {
      const response = await admin.get(`/api/websites/${websiteId}/events`, {
        params: { ...range(), pageSize: 50, eventType: 2 },
      });
      const event = response.body?.data?.find((e: any) => e.hasData);

      return event?.id as string | undefined;
    },
    READINESS_TIMEOUT_MS,
  );

  await poll(
    'the recorded replay',
    async () => {
      const response = await admin.get(`/api/websites/${websiteId}/replays`, {
        params: range(),
      });

      return response.body?.data?.some((r: any) => r.id === ingested.replay.visitId)
        ? true
        : undefined;
    },
    READINESS_TIMEOUT_MS,
  );

  return { sessionId, eventId };
}

export async function seedEnvironment(api: ApiClient): Promise<SeedState> {
  const db = process.env.UMAMI_TEST_DB === 'clickhouse' ? 'clickhouse' : 'postgres';

  const admin = api.bearer(await login(api, ADMIN_USER));
  const user = await ensureUser(admin, SEED_USERS.user);
  const viewer = await ensureUser(admin, SEED_USERS.viewer);
  const userApi = api.bearer(await login(api, SEED_USERS.user));

  const website = await recreateWebsite(admin, SEED_IDS.website, SEED_WEBSITES.primary);
  const website2 = await recreateWebsite(userApi, SEED_IDS.website2, SEED_WEBSITES.secondary);

  assertStatus(
    await admin.post(`/api/websites/${website.id}`, {
      replayConfig: {
        replayEnabled: true,
        heatmapEnabled: true,
        sampleRate: 1,
        heatmapSampleRate: 1,
      },
    }),
    200,
    'enable recorder',
  );

  const share = assertStatus(
    await admin.post(`/api/websites/${website.id}/shares`, { ...SEED_SHARE, parameters: {} }),
    200,
    'create share',
  ).body;

  const link = await ensureEntity(admin, 'links', SEED_IDS.link, SEED_LINK);
  const pixel = await ensureEntity(admin, 'pixels', SEED_IDS.pixel, SEED_PIXEL);
  const team = await ensureTeam(admin, user.id);

  const dataset = buildDataset();
  const ingested = await ingestDataset(api, dataset);
  const { sessionId, eventId } = await waitForAnalytics(admin, dataset, ingested);

  return {
    db,
    createdAt: new Date().toISOString(),
    admin: { ...ADMIN_USER },
    user,
    viewer,
    website: { id: website.id, name: website.name, domain: website.domain },
    website2: { id: website2.id, name: website2.name, domain: website2.domain },
    link: { id: link.id, name: link.name, url: link.url, slug: link.slug },
    pixel: { id: pixel.id, name: pixel.name, slug: pixel.slug },
    team,
    share: { id: share.id, slug: share.slug },
    range: dataset.range,
    data: {
      hostname: HOSTNAME,
      currency: CURRENCY,
      pages: dataset.pages,
      eventNames: dataset.eventNames,
      distinctIds: dataset.distinctIds,
      expectedPageviews: dataset.expected.pageviews,
      expectedWebsite2Pageviews: dataset.expected.website2Pageviews,
      sessionId,
      eventId,
      replayVisitId: ingested.replay.visitId,
      replaySessionId: ingested.replay.sessionId,
    },
  };
}
