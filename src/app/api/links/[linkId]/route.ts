import { z } from 'zod';
import { canUpdateLink, canDeleteLink, canViewLink } from '@/validations';
import { SHARE_ID_REGEX } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { ok, json, unauthorized, serverError } from '@/lib/response';
import { deleteLink, getLink, updateLink } from '@/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewLink(auth, websiteId))) {
    return unauthorized();
  }

  const website = await getLink(websiteId);

  return json(website);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    name: z.string().optional(),
    domain: z.string().optional(),
    shareId: z.string().regex(SHARE_ID_REGEX).nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { name, domain, shareId } = body;

  if (!(await canUpdateLink(auth, websiteId))) {
    return unauthorized();
  }

  try {
    const website = await updateLink(websiteId, { name, domain, shareId });

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
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canDeleteLink(auth, websiteId))) {
    return unauthorized();
  }

  await deleteLink(websiteId);

  return ok();
}
