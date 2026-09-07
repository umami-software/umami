import { test as base, request } from '@playwright/test';
import { ApiClient } from './client';
import { login } from './helpers/auth';
import { SHARE_CONTEXT_HEADER, SHARE_TOKEN_HEADER } from './helpers/constants';
import { readSeedState, type SeedState } from './seed/state';

export interface WorkerTokens {
  admin: string;
  user: string;
  viewer: string;
  apiKey: { id: string; key: string };
}

interface WorkerFixtures {
  /** Seeded entities and dataset metadata written by global setup. */
  seed: SeedState;
  /** Auth tokens created once per worker process. */
  tokens: WorkerTokens;
}

interface TestFixtures {
  /** Unauthenticated client. */
  api: ApiClient;
  /** Logged in as the built-in admin (owns the seeded website, link, pixel, team). */
  admin: ApiClient;
  /** Logged in as the seeded regular user (owns website2, member of the seeded team). */
  user: ApiClient;
  /** Logged in as the seeded view-only user, who owns nothing. */
  viewer: ApiClient;
  /** Authenticated with an admin API key (`umami_…`) instead of a session token. */
  apiKey: ApiClient;
  /** Resolves a share slug to a client authenticated with a share token. */
  share: (slug?: string) => Promise<ApiClient>;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires the destructuring form
  seed: [async ({}, use) => use(readSeedState()), { scope: 'worker' }],

  tokens: [
    async ({ seed }, use, workerInfo) => {
      const context = await request.newContext({ baseURL: workerInfo.project.use.baseURL });
      const raw = new ApiClient(context);

      try {
        const admin = await login(raw, seed.admin);
        const user = await login(raw, seed.user);
        const viewer = await login(raw, seed.viewer);

        const created = await raw
          .bearer(admin)
          .post('/api/me/api-keys', { name: `api-tests-worker-${workerInfo.workerIndex}` });

        if (created.status !== 200 || !created.body?.key) {
          throw new Error(`Failed to create API key (${created.status}): ${created.text}`);
        }

        const apiKey = { id: created.body.id as string, key: created.body.key as string };

        await use({ admin, user, viewer, apiKey });

        await raw.bearer(admin).del(`/api/me/api-keys/${apiKey.id}`);
      } finally {
        await context.dispose();
      }
    },
    { scope: 'worker' },
  ],

  api: async ({ request }, use) => use(new ApiClient(request)),
  admin: async ({ api, tokens }, use) => use(api.bearer(tokens.admin)),
  user: async ({ api, tokens }, use) => use(api.bearer(tokens.user)),
  viewer: async ({ api, tokens }, use) => use(api.bearer(tokens.viewer)),
  apiKey: async ({ api, tokens }, use) => use(api.bearer(tokens.apiKey.key)),

  share: async ({ api, seed }, use) =>
    use(async (slug = seed.share.slug) => {
      const response = await api.get(`/api/share/${slug}`);

      if (response.status !== 200 || !response.body?.token) {
        throw new Error(`Failed to resolve share ${slug} (${response.status}): ${response.text}`);
      }

      return api.with({
        [SHARE_TOKEN_HEADER]: response.body.token,
        [SHARE_CONTEXT_HEADER]: '1',
      });
    }),
});

export { expect } from '@playwright/test';
