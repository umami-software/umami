import z from 'zod';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { anyObjectParam } from '@/lib/schema';
import { canDeleteEntity, canUpdateEntity, canViewEntity } from '@/permissions';
import { deleteShare, getShare, updateShare } from '@/queries/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { shareId } = await params;

  const share = await getShare(shareId);

  if (!(await canViewEntity(auth, share.entityId))) {
    return unauthorized();
  }

  return json(share);
}

export async function POST(request: Request, { params }: { params: Promise<{ shareId: string }> }) {
  const schema = z.object({
    slug: z.string().max(100),
    parameters: anyObjectParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { shareId } = await params;
  const { slug, parameters } = body;

  const share = await getShare(shareId);

  if (!share) {
    return notFound();
  }

  if (!(await canUpdateEntity(auth, share.entityId))) {
    return unauthorized();
  }

  const result = await updateShare(shareId, {
    slug,
    parameters,
  } as any);

  return json(result);
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

  if (!(await canDeleteEntity(auth, share.entityId))) {
    return unauthorized();
  }

  await deleteShare(shareId);

  return ok();
}
