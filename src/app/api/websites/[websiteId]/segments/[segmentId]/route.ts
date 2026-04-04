import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { anyObjectParam, segmentTypeParam } from '@/lib/schema';
import { canDeleteWebsite, canUpdateWebsite, canViewWebsite } from '@/permissions';
import { deleteSegment, getWebsiteSegment, updateSegment } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; segmentId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, segmentId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const segment = await getWebsiteSegment(websiteId, segmentId);

  if (!segment) {
    return notFound();
  }

  return json(segment);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; segmentId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    name: z.string().max(200),
    parameters: anyObjectParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, segmentId } = await params;
  const { type, name, parameters } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const segment = await getWebsiteSegment(websiteId, segmentId);

  if (!segment) {
    return notFound();
  }

  const result = await updateSegment(segmentId, {
    type,
    name,
    parameters,
  } as any);

  return json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; segmentId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, segmentId } = await params;

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const segment = await getWebsiteSegment(websiteId, segmentId);

  if (!segment) {
    return notFound();
  }

  await deleteSegment(segmentId);

  return ok();
}
