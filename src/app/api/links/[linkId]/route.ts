import { z } from 'zod';
import { validateUrl } from '@/lib/og';
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

const ogTextField = (max: number) =>
  z
    .string()
    .max(max)
    .transform(v => {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    })
    .nullable()
    .optional();

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.host;
  } catch {
    return false;
  }
}

function isPublicHttpUrl(value: string): boolean {
  return isHttpUrl(value) && validateUrl(value) !== null;
}

const ogImageField = z
  .string()
  .max(2047)
  .transform(v => {
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  })
  .nullable()
  .optional()
  .refine(v => v == null || isPublicHttpUrl(v), {
    message: 'ogImage must be a public http(s) URL',
  });

export async function POST(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    url: z
      .string()
      .max(500)
      .refine(isHttpUrl, { message: 'url must be an http(s) URL' })
      .optional(),
    slug: z.string().min(8).max(100).optional(),
    utmSource: utmField,
    utmMedium: utmField,
    utmCampaign: utmField,
    utmTerm: utmField,
    utmContent: utmField,
    ogTitle: ogTextField(255),
    ogDescription: ogTextField(500),
    ogImage: ogImageField,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { linkId } = await params;
  const {
    name,
    url,
    slug,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    ogTitle,
    ogDescription,
    ogImage,
  } = body;

  if (!(await canUpdateLink(auth, linkId))) {
    return unauthorized();
  }

  // Preserve undefined/null distinction for og fields (preserve vs clear-to-auto).
  const payload: any = {
    name,
    url,
    slug,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  };
  if (ogTitle !== undefined) payload.ogTitle = ogTitle;
  if (ogDescription !== undefined) payload.ogDescription = ogDescription;
  if (ogImage !== undefined) payload.ogImage = ogImage;

  try {
    const result = await updateLink(linkId, payload);

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
