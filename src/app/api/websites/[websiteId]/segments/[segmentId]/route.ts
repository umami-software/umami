import { canDeleteWebsite, canUpdateWebsite, canViewWebsite } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { segmentTypeParam } from '@/lib/schema';
import { deleteSegment, getSegment, updateSegment } from '@/queries';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; segmentId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, segmentId } = await params;

  const segment = await getSegment(segmentId);

  if (websiteId && !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
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
    parameters: z.object({}).passthrough(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, segmentId } = await params;
  const { type, name, parameters } = body;

  const segment = await getSegment(segmentId);

  if (!segment) {
    return notFound();
  }

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
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

  const segment = await getSegment(segmentId);

  if (!segment) {
    return notFound();
  }

  if (!(await canDeleteWebsite(auth, websiteId))) {
    return unauthorized();
  }

  await deleteSegment(segmentId);

  return ok();
}
