import { z } from 'zod';
import { canUpdateLink, canDeleteLink, canViewLink } from '@/permissions';
import { parseRequest } from '@/lib/request';
import { ok, json, unauthorized, serverError, badRequest } from '@/lib/response';
import { deleteLink, getLink, updateLink } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { linkId } = await params;

  if (!(await canViewLink(auth, linkId))) {
    return unauthorized();
  }

  const website = await getLink(linkId);

  return json(website);
}

export async function POST(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const schema = z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    slug: z.string().min(8).optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { linkId } = await params;
  const { name, url, slug } = body;

  if (!(await canUpdateLink(auth, linkId))) {
    return unauthorized();
  }

  try {
    const result = await updateLink(linkId, { name, url, slug });

    return Response.json(result);
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint') && e.message.includes('slug')) {
      return badRequest({ message: 'That slug is already taken.' });
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { linkId } = await params;

  if (!(await canDeleteLink(auth, linkId))) {
    return unauthorized();
  }

  await deleteLink(linkId);

  return ok();
}
