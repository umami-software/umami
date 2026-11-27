import z from 'zod';
import { ENTITY_TYPE } from '@/lib/constants';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, ok, serverError, unauthorized } from '@/lib/response';
import { shareParametersSchema } from '@/lib/schema';
import { canDeleteEntity, canUpdateEntity, canViewEntity } from '@/permissions';
import { deleteShare, getShare, getWebsiteSegment, updateShare } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { shareId } = await params;

  const share = await getShare(shareId);

  if (!share) {
    return notFound();
  }

  if (!(await canViewEntity(auth, share.entityId))) {
    return unauthorized();
  }

  return json(share);
}

export async function POST(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const schema = z.object({
    name: z.string().max(200),
    slug: z.string().max(100),
    parameters: shareParametersSchema,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { shareId } = await params;
  const { name, slug, parameters } = body;

  const share = await getShare(shareId);

  if (!share) {
    return notFound();
  }

  if (!(await canUpdateEntity(auth, share.entityId))) {
    return unauthorized();
  }

  if ((parameters.segment || parameters.filters?.length) && share.shareType !== ENTITY_TYPE.website) {
    return badRequest({ message: 'Invalid segment.' });
  }

  if (parameters.segment) {
    const segment = await getWebsiteSegment(share.entityId, parameters.segment);

    if (!segment) {
      return badRequest({ message: 'Invalid segment.' });
    }
  }

  try {
    const result = await updateShare(shareId, {
      name,
      slug,
      parameters,
    } as any);

    return json(result);
  } catch (e: any) {
    if (e.message.toLowerCase().includes('unique constraint') && e.message.includes('slug')) {
      return badRequest({ message: 'That slug is already taken.' });
    }

    return serverError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { shareId } = await params;

  const share = await getShare(shareId);

  if (!share) {
    return notFound();
  }

  if (!(await canDeleteEntity(auth, share.entityId))) {
    return unauthorized();
  }

  await deleteShare(shareId);

  return ok();
}
