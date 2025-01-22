import { z } from 'zod';
import { canUpdateWebsite, canDeleteWebsite, checkAuth, canViewWebsite } from 'lib/auth';
import { SHARE_ID_REGEX } from 'lib/constants';
import { checkRequest } from 'lib/request';
import { ok, json, badRequest, unauthorized, serverError } from 'lib/response';
import { deleteWebsite, getWebsite, updateWebsite } from 'queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const website = await getWebsite(websiteId);

  return json(website);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    name: z.string(),
    domain: z.string(),
    shareId: z.string().regex(SHARE_ID_REGEX).nullable(),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);
  const { websiteId } = await params;
  const { name, domain, shareId } = body;

  if (!auth || !(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const website = await updateWebsite(websiteId, { name, domain, shareId });

    return Response.json(website);
  } catch (e: any) {
    if (e.message.includes('Unique constraint') && e.message.includes('share_id')) {
      return serverError(new Error('That share ID is already taken.'));
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const auth = await checkAuth(request);

  if (!auth) {
    return unauthorized();
  }

  const { websiteId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await deleteWebsite(websiteId);

  return ok();
}
