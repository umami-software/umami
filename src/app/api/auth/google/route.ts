import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { getGoogleAuthUrl } from '@/lib/google';
import { canUpdateWebsite } from '@/permissions';

const schema = z.object({
  websiteId: z.uuid(),
});

export async function GET(request: Request) {
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = query;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const secret = process.env.APP_SECRET;
  if (!secret) {
    return badRequest({ message: 'APP_SECRET is not configured' });
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return badRequest({ message: 'Google OAuth is not configured' });
  }

  const origin = new URL(request.url).origin;
  const basePath = process.env.BASE_PATH ?? '';
  const redirectUri = `${origin}${basePath}/api/auth/google/callback`;

  const state = jwt.sign({ websiteId }, secret, { expiresIn: '10m' });
  const url = getGoogleAuthUrl(state, redirectUri);

  return json({ url });
}
