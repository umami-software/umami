import { z } from 'zod';
import { getLinksUrls } from '@/lib/config';
import { parseRequest } from '@/lib/request';
import { badRequest, json, ok, serverError, unauthorized } from '@/lib/response';
import { isValidUrl } from '@/lib/url';
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

export async function POST(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    // Same rule as the link form; a relative url makes the /q redirect fail.
    url: z.string().trim().max(500).refine(isValidUrl, { message: 'Invalid URL.' }).optional(),
    slug: z.string().min(8).max(100).optional(),
    // Must be one of the configured LINKS_URL entries; empty resets it to the default.
    baseUrl: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .refine(value => !value || getLinksUrls().includes(value), {
        message: 'Invalid base URL.',
      }),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { linkId } = await params;
  const { name, url, slug, baseUrl } = body;

  if (!(await canUpdateLink(auth, linkId))) {
    return unauthorized();
  }

  try {
    const result = await updateLink(linkId, {
      name,
      url,
      slug,
      baseUrl: baseUrl === '' ? null : baseUrl,
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
