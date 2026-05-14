import { z } from 'zod';
import { ENTITY_TYPE } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams } from '@/lib/schema';
import { canUpdatePixel, canViewPixel } from '@/permissions';
import { createShare, getSharesByEntityId } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pixelId: string }> },
) {
  const schema = z.object({
    ...filterParams,
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { pixelId } = await params;
  const { page, pageSize, search } = query;

  if (!(await canViewPixel(auth, pixelId))) {
    return unauthorized();
  }

  const data = await getSharesByEntityId(pixelId, {
    page,
    pageSize,
    search,
  });

  return json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pixelId: string }> },
) {
  const schema = z.object({
    name: z.string().max(200),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { pixelId } = await params;
  const { name } = body;

  if (!(await canUpdatePixel(auth, pixelId))) {
    return unauthorized();
  }

  const share = await createShare({
    id: uuid(),
    entityId: pixelId,
    shareType: ENTITY_TYPE.pixel,
    name,
    slug: getRandomChars(16),
    parameters: {},
  });

  return json(share);
}
