import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { exchangeCodeForTokens } from '@/lib/google';
import { parseRequest } from '@/lib/request';
import { badRequest } from '@/lib/response';
import { upsertWebsiteGoogleAuth } from '@/queries/prisma';

const schema = z.object({
  code: z.string(),
  state: z.string(),
});

export async function GET(request: Request) {
  const { query, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return error();
  }

  const { code, state } = query;

  const secret = process.env.APP_SECRET;
  if (!secret) {
    return badRequest({ message: 'APP_SECRET is not configured' });
  }

  let websiteId: string;
  try {
    const decoded = jwt.verify(state, secret) as { websiteId: string };
    websiteId = decoded.websiteId;
  } catch {
    return badRequest({ message: 'Invalid or expired state parameter' });
  }

  const origin = new URL(request.url).origin;
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : '';
  const redirectUri = `${origin}${basePath}/api/auth/google/callback`;

  try {
    const { accessToken, refreshToken, expiresAt, email } = await exchangeCodeForTokens(
      code,
      redirectUri,
    );
    await upsertWebsiteGoogleAuth(websiteId, { accessToken, refreshToken, expiresAt, email });
  } catch {
    return Response.redirect(`${origin}${basePath}/websites/${websiteId}/settings?gsc_error=1`);
  }

  return Response.redirect(`${origin}${basePath}/websites/${websiteId}/settings`);
}
