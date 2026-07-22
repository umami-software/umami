import { betterAuth, type BetterAuthPlugin } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer, username } from 'better-auth/plugins';
import { ssoToken } from '@/lib/auth-plugins/sso-token';
import { ROLES } from '@/lib/constants';
import { secret, uuid } from '@/lib/crypto';
import { checkPassword, hashPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

const BETTER_AUTH = 'better-auth-instance';

// better-auth stores raw string values and writes some keys without a TTL
// (e.g. per-user active session lists), so this must bypass the JSON +
// default-TTL behavior of the standard redis wrapper methods.
const secondaryStorage = redis.enabled
  ? {
      get: (key: string) => redis.client.getRaw(`ba:${key}`),
      set: (key: string, value: string, ttl?: number) => {
        return redis.client.setRaw(`ba:${key}`, value, ttl).then(() => undefined);
      },
      delete: (key: string) => redis.client.del(`ba:${key}`).then(() => undefined),
    }
  : undefined;

function getAuth() {
  return betterAuth({
    secret: secret(),
    // Next.js strips the app basePath (BASE_PATH) before route handlers run,
    // so better-auth sees paths without it. The client-side baseURL does
    // include the prefix (see src/lib/auth-client.ts).
    basePath: '/api/auth',
    trustedOrigins: [process.env.CLOUD_URL].filter(Boolean),
    database: prismaAdapter(prisma.client, { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      revokeSessionsOnPasswordReset: true,
      password: {
        // Keep bcryptjs as the canonical password format so existing hashes
        // verify unchanged (no rehash-on-login).
        hash: async (password: string) => hashPassword(password),
        verify: async ({ hash, password }: { hash: string; password: string }) =>
          checkPassword(password, hash),
      },
    },
    user: {
      modelName: 'user',
      fields: {
        name: 'displayName',
        image: 'logoUrl',
      },
    },
    session: {
      // The analytics visitor table owns the "session" name.
      modelName: 'authSession',
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
      // With Redis available, sessions live only in Redis.
      storeSessionInDatabase: false,
    },
    secondaryStorage,
    advanced: {
      database: {
        // user_id is a uuid-typed column; better-auth's default random ids
        // would violate it if better-auth ever creates a user.
        generateId: () => uuid(),
      },
      cookiePrefix: 'umami',
      // Infer https (secure cookies) correctly behind reverse proxies.
      trustedProxyHeaders: true,
      // better-auth defaults to Secure cookies whenever NODE_ENV=production,
      // which breaks plain-http (e.g. LAN) self-hosted deployments. Default to
      // Secure only for https cloud deployments; opt in via COOKIE_SECURE=1.
      useSecureCookies: process.env.COOKIE_SECURE
        ? !['0', 'false'].includes(process.env.COOKIE_SECURE)
        : (process.env.CLOUD_URL || '').startsWith('https://'),
      ...(process.env.COOKIE_DOMAIN
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: process.env.COOKIE_DOMAIN,
            },
          }
        : {}),
    },
    rateLimit: {
      enabled: true,
    },
    plugins: [
      // The casts work around better-auth's plugin types requiring
      // strictNullChecks, which this project has disabled.
      username({
        // Umami usernames are arbitrary strings up to 255 chars (may contain
        // hyphens, dots, @, etc.), so relax the plugin defaults (3-30
        // alphanumeric characters) to match existing data.
        minUsernameLength: 1,
        maxUsernameLength: 255,
        usernameValidator: () => true,
        // Umami stores usernames case-sensitively and allows case-only
        // distinct accounts (e.g. `Francis+222@…` and `francis+222@…` both
        // exist). The plugin default lowercases the typed username before
        // lookup, which breaks sign-in for mixed-case users. Disable it so
        // the `username` column is matched exactly, matching legacy behavior.
        usernameNormalization: false,
      }) as unknown as BetterAuthPlugin,
      admin({
        adminRoles: [ROLES.admin],
        defaultRole: ROLES.user,
      }) as unknown as BetterAuthPlugin,
      bearer(),
      ssoToken(),
    ],
  });
}

export const auth: ReturnType<typeof getAuth> = globalThis[BETTER_AUTH] || getAuth();

if (process.env.NODE_ENV !== 'production') {
  globalThis[BETTER_AUTH] = auth;
}

/**
 * Sets a user's password (bcrypt via the configured password hasher) directly
 * on their credential account row. Used by umami's own user-management routes,
 * which enforce their own permission checks.
 */
export async function setUserPassword(userId: string, newPassword: string) {
  const ctx = await auth.$context;

  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(newPassword));
}

/**
 * Revokes all of a user's sessions (database and/or secondary storage).
 */
export async function revokeUserSessions(userId: string) {
  const ctx = await auth.$context;

  await ctx.internalAdapter.deleteUserSessions(userId);
}
