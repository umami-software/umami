import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsite } from '@/permissions';
import { deleteWebsiteGoogleAuth, getWebsiteGoogleAuthStatus } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const status = await getWebsiteGoogleAuthStatus(websiteId);

  return json({
    connected: !!status,
    email: status?.email ?? null,
    propertyUrl: status?.propertyUrl ?? null,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    await deleteWebsiteGoogleAuth(websiteId);
  } catch {
    return notFound();
  }

  return json({ ok: true });
}
