import { createToken, parseToken } from '@/lib/jwt';
import { secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { unauthorized, serverError } from '@/lib/response';
import { canViewAuthenticatedWebsite } from '@/permissions';

export function validateDownloadToken(token: string, websiteId: string): boolean {
  const payload = parseToken(token, secret());
  if (!payload) return false;
  return (payload as any).websiteId === websiteId;
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

    // Create a stateless JWT scoped to this specific websiteId, expiring in 60 seconds
    const downloadToken = createToken({ websiteId }, secret(), { expiresIn: '60s' });

    return Response.json({ downloadToken });
  } catch (e) {
    return serverError(e);
  }
}