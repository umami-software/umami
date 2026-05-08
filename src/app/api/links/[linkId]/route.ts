import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, serverError, unauthorized } from '@/lib/response';
import { canDeleteLink, canUpdateLink, canViewLink } from '@/permissions';
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

const utmField = z
  .string()
  .max(255)
  .transform(v => (v === '' ? null : v))
  .nullable()
  .optional();

export async function POST(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const schema = z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    slug: z.string().min(8).optional(),
    utmSource: utmField,
    utmMedium: utmField,
    utmCampaign: utmField,
    utmTerm: utmField,
    utmContent: utmField,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { linkId } = await params;
  const { name, url, slug, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

  if (!(await canUpdateLink(auth, linkId))) {
    return unauthorized();
  }

  try {
    const result = await updateLink(linkId, {
      name,
      url,
      slug,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

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
