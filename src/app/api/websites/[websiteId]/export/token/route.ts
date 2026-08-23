import crypto from 'crypto';
import { parseRequest } from '@/lib/request';
import { unauthorized, serverError } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';

const downloadTokens = new Map<string, number>();
const TOKEN_TTL_MS = 60_000;

export function validateAndConsumeDownloadToken(token: string): boolean {
  const expiry = downloadTokens.get(token);
  if (expiry === undefined) return false;
  downloadTokens.delete(token);
  return Date.now() <= expiry;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const shareToken = url.searchParams.get('shareToken');

  const modifiedRequest = new Request(request.url, {
    method: 'GET',
    headers: new Headers(request.headers),
  });
  if (token) modifiedRequest.headers.set('authorization', `Bearer ${token}`);
  if (shareToken) {
    modifiedRequest.headers.set('x-umami-share-token', shareToken);
    modifiedRequest.headers.set('x-umami-share-context', '1');
  }

  try {
    const { auth, error } = await parseRequest(modifiedRequest);
    if (error) return error();

    const { websiteId } = await params;
    if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
      return unauthorized();
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    downloadTokens.set(downloadToken, Date.now() + TOKEN_TTL_MS);

    return Response.json({ downloadToken });
  } catch (e) {
    return serverError(e);
  }
}