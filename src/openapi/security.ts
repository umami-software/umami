import { OAUTH_SCOPE_DESCRIPTIONS, type OAuthScope } from '@/lib/oauth/scopes';
import type { ApiAuth } from '@/openapi/operation';

export const securitySchemes = {
  bearerAuth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description:
      'Token returned by POST /api/auth/login, or an API key (`umami_…`) created under Settings → API keys (self-hosted only).',
  },
  oauth2: {
    type: 'oauth2' as const,
    description:
      'OAuth 2.1 access token (authorization code + PKCE). Only operations that declare an OAuth scope accept these tokens.',
    flows: {
      authorizationCode: {
        authorizationUrl: '/oauth/authorize',
        tokenUrl: '/api/oauth/token',
        refreshUrl: '/api/oauth/token',
        scopes: OAUTH_SCOPE_DESCRIPTIONS,
      },
    },
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

export function getSecurityRequirements(auth: ApiAuth, scope?: OAuthScope | null) {
  if (auth === 'none') {
    return [];
  }

  const requirements: Record<string, string[]>[] = [{ bearerAuth: [] }];

  if (scope) {
    requirements.push({ oauth2: [scope] });
  }

  if (auth === 'bearer-or-share') {
    requirements.push({ shareToken: [], shareContext: [] });
  }

  return requirements;
}
