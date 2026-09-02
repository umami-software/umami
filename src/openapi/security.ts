import type { ApiAuth } from '@/openapi/operation';

export const securitySchemes = {
  bearerAuth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
      'Token returned by POST /api/auth/login, or an API key (`umami_…`) created under Settings → API keys (self-hosted only).',
  },
  shareToken: {
    type: 'apiKey' as const,
    in: 'header' as const,
    name: 'x-umami-share-token',
    description: 'Signed token returned by a share endpoint.',
  },
  shareContext: {
    type: 'apiKey' as const,
    in: 'header' as const,
    name: 'x-umami-share-context',
    description: 'Required context header when authenticating with a share token.',
  },
};

export function getSecurityRequirements(auth: ApiAuth) {
  if (auth === 'none') {
    return [];
  }

  if (auth === 'bearer-or-share') {
    return [{ bearerAuth: [] }, { shareToken: [], shareContext: [] }];
  }

  return [{ bearerAuth: [] }];
}
