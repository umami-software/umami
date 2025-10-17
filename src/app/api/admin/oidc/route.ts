import { z } from 'zod';
export const runtime = 'nodejs';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { getEffectiveOIDCConfig } from '@/lib/oidc';
import { setSetting } from '@/queries/prisma/setting';

const schema = z.object({
  issuerUrl: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().optional(),
  redirectUri: z.string().url(),
  scopes: z.string().default('openid profile email').optional(),
  usernameClaim: z.string().default('preferred_username').optional(),
  autoCreateUsers: z.boolean().default(true).optional(),
});

export async function GET(request: Request) {
  const { auth, error } = await parseRequest(request);
  if (error) return error();
  if (!auth?.user?.isAdmin) return unauthorized();

  const cfg = await getEffectiveOIDCConfig();
  return json(cfg);
}

export async function POST(request: Request) {
  const { auth, body, error } = await parseRequest(request, schema);
  if (error) return error();
  if (!auth?.user?.isAdmin) return unauthorized();

  const { issuerUrl, clientId, clientSecret, redirectUri, scopes, usernameClaim, autoCreateUsers } =
    body;

  await Promise.all([
    setSetting('oidc:issuerUrl', issuerUrl),
    setSetting('oidc:clientId', clientId),
    setSetting('oidc:clientSecret', clientSecret || null),
    setSetting('oidc:redirectUri', redirectUri),
    setSetting('oidc:scopes', scopes || 'openid profile email'),
    setSetting('oidc:usernameClaim', usernameClaim || 'preferred_username'),
    setSetting('oidc:autoCreateUsers', String(Boolean(autoCreateUsers))),
  ]);

  return json({ success: true });
}
